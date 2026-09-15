#!/usr/bin/env python3
"""Select stale Lumen lane work and invoke a configured wake adapter."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Iterable

KNOWN_LANES = {
    "Product Management & Prioritization": "pm",
    "Implementation & Delivery": "implementation",
    "Quality": "quality",
    "Platform Architect": "platform-architect",
    "UX & Product Design": "ux",
}
OWNER_RE = re.compile(r"(?ims)^## Owner\s*\n\s*([^\n]+)")
DEPENDENCY_RE = re.compile(r"(?i)(?:depends on|blocked by)\s+#(\d+)")
WAKE_MARKER = "<!-- lumen-controller:wake"


@dataclass(frozen=True)
class Candidate:
    number: int
    title: str
    lane: str
    updated_at: datetime
    body: str
    url: str
    priority: int


def parse_owner(body: str) -> str | None:
    match = OWNER_RE.search(body or "")
    if not match:
        return None
    return KNOWN_LANES.get(match.group(1).strip())


def priority_for(title: str, body: str) -> int:
    text = f"{title}\n{body}".lower()
    if "p0" in text or "critical" in text or "blocker" in text:
        return 0
    if "p1" in text or "high priority" in text:
        return 1
    return 2


def parse_time(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def dependencies(body: str) -> set[int]:
    return {int(value) for value in DEPENDENCY_RE.findall(body or "")}


def select_candidates(issues: Iterable[dict], now: datetime, stale_minutes: int) -> list[Candidate]:
    open_numbers = {issue["number"] for issue in issues if "pull_request" not in issue}
    cutoff = now - timedelta(minutes=stale_minutes)
    candidates: list[Candidate] = []
    for issue in issues:
        if "pull_request" in issue:
            continue
        lane = parse_owner(issue.get("body") or "")
        if lane is None:
            continue
        labels = {label["name"].lower() for label in issue.get("labels", [])}
        if "blocked" in labels or "hold" in labels:
            continue
        if dependencies(issue.get("body") or "") & open_numbers:
            continue
        updated_at = parse_time(issue["updated_at"])
        if updated_at > cutoff:
            continue
        candidates.append(Candidate(
            number=issue["number"],
            title=issue["title"],
            lane=lane,
            updated_at=updated_at,
            body=issue.get("body") or "",
            url=issue["html_url"],
            priority=priority_for(issue["title"], issue.get("body") or ""),
        ))

    chosen: dict[str, Candidate] = {}
    for candidate in sorted(candidates, key=lambda c: (c.priority, c.updated_at, c.number)):
        chosen.setdefault(candidate.lane, candidate)
    return list(chosen.values())


def request_json(url: str, token: str, method: str = "GET", payload: dict | None = None) -> object:
    data = json.dumps(payload).encode() if payload is not None else None
    request = urllib.request.Request(url, data=data, method=method)
    request.add_header("Accept", "application/vnd.github+json")
    request.add_header("Authorization", f"Bearer {token}")
    request.add_header("X-GitHub-Api-Version", "2022-11-28")
    if payload is not None:
        request.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(request, timeout=20) as response:
        body = response.read().decode()
        return json.loads(body) if body else {}


def recently_woken(repo: str, candidate: Candidate, github_token: str, now: datetime, suppress_minutes: int) -> bool:
    comments = request_json(
        f"https://api.github.com/repos/{repo}/issues/{candidate.number}/comments?per_page=100",
        github_token,
    )
    cutoff = now - timedelta(minutes=suppress_minutes)
    for comment in comments:
        if WAKE_MARKER not in (comment.get("body") or ""):
            continue
        if parse_time(comment["created_at"]) >= cutoff:
            return True
    return False


def wake_payload(repo: str, candidate: Candidate) -> dict:
    return {
        "source": "lumen-github-controller",
        "repository": repo,
        "lane": candidate.lane,
        "issue": candidate.number,
        "title": candidate.title,
        "url": candidate.url,
        "instruction": (
            "Pick up this dependency-ready Lumen work now. Read the issue and current GitHub state, "
            "execute the next required artifact, and keep GitHub as the source of truth."
        ),
    }


def invoke_webhook(url: str, token: str | None, payload: dict) -> None:
    data = json.dumps(payload).encode()
    request = urllib.request.Request(url, data=data, method="POST")
    request.add_header("Content-Type", "application/json")
    if token:
        request.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(request, timeout=20) as response:
        if response.status >= 300:
            raise RuntimeError(f"wake adapter returned HTTP {response.status}")


def invoke_repository_dispatch(repo: str, github_token: str, payload: dict) -> None:
    request_json(
        f"https://api.github.com/repos/{repo}/dispatches",
        github_token,
        method="POST",
        payload={"event_type": "lumen_lane_wake", "client_payload": payload},
    )


def add_wake_marker(repo: str, candidate: Candidate, github_token: str, now: datetime) -> None:
    marker = (
        f"{WAKE_MARKER} lane={candidate.lane} issue={candidate.number} "
        f"at={now.isoformat()} -->\n"
        "Execution controller wake sent. Further wakes are suppressed while this window is fresh."
    )
    request_json(
        f"https://api.github.com/repos/{repo}/issues/{candidate.number}/comments",
        github_token,
        method="POST",
        payload={"body": marker},
    )


def log(action: str, **fields: object) -> None:
    print(json.dumps({"action": action, **fields}, sort_keys=True))


def run(args: argparse.Namespace) -> int:
    repo = args.repo or os.environ.get("GITHUB_REPOSITORY")
    github_token = os.environ.get("GITHUB_TOKEN")
    if not repo or not github_token:
        raise RuntimeError("GITHUB_REPOSITORY and GITHUB_TOKEN are required")

    now = datetime.now(timezone.utc)
    issues = request_json(f"https://api.github.com/repos/{repo}/issues?state=open&per_page=100", github_token)
    candidates = select_candidates(issues, now, args.stale_minutes)
    if not candidates:
        log("idle", reason="no_dependency_ready_stale_lane_work")
        return 0

    adapter_url = os.environ.get("LUMEN_WAKE_WEBHOOK_URL")
    adapter_token = os.environ.get("LUMEN_WAKE_WEBHOOK_TOKEN")
    for candidate in candidates:
        payload = wake_payload(repo, candidate)
        if recently_woken(repo, candidate, github_token, now, args.suppress_minutes):
            log("suppress", lane=candidate.lane, issue=candidate.number, reason="recent_wake")
            continue
        if args.dry_run:
            log("would_wake", **payload)
            continue
        if adapter_url:
            invoke_webhook(adapter_url, adapter_token, payload)
            adapter = "external_webhook"
        else:
            invoke_repository_dispatch(repo, github_token, payload)
            adapter = "github_repository_dispatch"
        add_wake_marker(repo, candidate, github_token, now)
        log("wake", adapter=adapter, **payload)
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--stale-minutes", type=int, default=int(os.getenv("LUMEN_STALE_MINUTES", "15")))
    parser.add_argument("--suppress-minutes", type=int, default=int(os.getenv("LUMEN_SUPPRESS_MINUTES", "30")))
    return parser


if __name__ == "__main__":
    try:
        sys.exit(run(build_parser().parse_args()))
    except (RuntimeError, urllib.error.URLError) as exc:
        log("error", message=str(exc))
        sys.exit(1)
