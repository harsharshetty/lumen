#!/usr/bin/env python3
"""Execute one Lumen lane wake through the OpenAI Responses API and bounded GitHub tools."""

from __future__ import annotations

import base64
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from typing import Any

MAX_CHANGED_FILES = 8
MAX_TOOL_ROUNDS = 12
MAX_READ_CHARS = 20000

LANE_ROLES = {
    "implementation": "Implementation & Delivery engineer. Produce the smallest safe implementation artifact and open a PR.",
    "quality": "Quality engineer. Reproduce/verify the issue, add or correct automated proof, and open a PR when code changes are needed.",
    "platform-architect": "Platform architect. Prefer repository-backed architecture/configuration artifacts and ADR/document changes when appropriate.",
    "ux": "UX & Product Design implementer. Make bounded UI/UX changes only when the issue is implementation-ready; otherwise record the exact blocking decision.",
    "pm": "Product management execution worker. Update GitHub control-plane artifacts only; do not invent product decisions or implementation changes.",
}


def http_json(url: str, token: str | None = None, method: str = "GET", payload: Any | None = None) -> Any:
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Accept", "application/vnd.github+json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    if payload is not None:
        req.add_header("Content-Type", "application/json")
    if "api.github.com" in url:
        req.add_header("X-GitHub-Api-Version", "2022-11-28")
    with urllib.request.urlopen(req, timeout=45) as response:
        body = response.read().decode()
        return json.loads(body) if body else {}


def openai_response(api_key: str, payload: dict) -> dict:
    return http_json("https://api.openai.com/v1/responses", api_key, "POST", payload)


def clamp(value: Any, limit: int = MAX_READ_CHARS) -> Any:
    text = json.dumps(value, ensure_ascii=False) if not isinstance(value, str) else value
    if len(text) <= limit:
        return value
    return text[:limit] + "\n...[truncated]"


@dataclass
class GithubTools:
    repo: str
    token: str
    issue: int
    lane: str
    branch: str
    base: str = "main"
    changed_paths: set[str] = field(default_factory=set)
    pr_number: int | None = None

    @property
    def api(self) -> str:
        return f"https://api.github.com/repos/{self.repo}"

    def create_branch(self) -> None:
        ref = http_json(f"{self.api}/git/ref/heads/{self.base}", self.token)
        sha = ref["object"]["sha"]
        http_json(f"{self.api}/git/refs", self.token, "POST", {"ref": f"refs/heads/{self.branch}", "sha": sha})

    def get_issue(self) -> Any:
        return clamp(http_json(f"{self.api}/issues/{self.issue}", self.token))

    def get_path(self, path: str) -> Any:
        encoded = urllib.parse.quote(path, safe="/")
        result = http_json(f"{self.api}/contents/{encoded}?ref={urllib.parse.quote(self.branch, safe='')}", self.token)
        if isinstance(result, dict) and result.get("type") == "file":
            content = base64.b64decode(result.get("content", "")).decode("utf-8", errors="replace")
            return {"path": path, "sha": result.get("sha"), "content": clamp(content)}
        if isinstance(result, list):
            return [{"name": item.get("name"), "path": item.get("path"), "type": item.get("type")} for item in result[:200]]
        return clamp(result)

    def write_file(self, path: str, content: str, message: str) -> Any:
        if path not in self.changed_paths and len(self.changed_paths) >= MAX_CHANGED_FILES:
            raise RuntimeError(f"file cap exceeded: maximum {MAX_CHANGED_FILES} changed files")
        encoded = urllib.parse.quote(path, safe="/")
        sha = None
        try:
            current = http_json(f"{self.api}/contents/{encoded}?ref={urllib.parse.quote(self.branch, safe='')}", self.token)
            if isinstance(current, dict):
                sha = current.get("sha")
        except urllib.error.HTTPError as exc:
            if exc.code != 404:
                raise
        payload = {
            "message": message[:120],
            "content": base64.b64encode(content.encode()).decode(),
            "branch": self.branch,
        }
        if sha:
            payload["sha"] = sha
        result = http_json(f"{self.api}/contents/{encoded}", self.token, "PUT", payload)
        self.changed_paths.add(path)
        return {"path": path, "commit": result.get("commit", {}).get("sha")}

    def open_pr(self, title: str, body: str) -> Any:
        if self.pr_number is not None:
            return {"number": self.pr_number, "already_open": True}
        result = http_json(
            f"{self.api}/pulls",
            self.token,
            "POST",
            {"title": title[:200], "body": body, "head": self.branch, "base": self.base},
        )
        self.pr_number = result["number"]
        return {"number": self.pr_number, "url": result.get("html_url")}

    def comment(self, body: str) -> Any:
        result = http_json(f"{self.api}/issues/{self.issue}/comments", self.token, "POST", {"body": body})
        return {"url": result.get("html_url")}

    def execute(self, name: str, arguments: dict) -> Any:
        if name == "get_issue":
            return self.get_issue()
        if name == "get_repo_path":
            return self.get_path(arguments.get("path", ""))
        if name == "write_file":
            return self.write_file(arguments["path"], arguments["content"], arguments.get("message", f"Work issue #{self.issue}"))
        if name == "open_pull_request":
            return self.open_pr(arguments["title"], arguments["body"])
        if name == "comment_issue":
            return self.comment(arguments["body"])
        raise RuntimeError(f"unknown tool: {name}")


TOOLS = [
    {"type": "function", "name": "get_issue", "description": "Read the assigned GitHub issue and current metadata.", "parameters": {"type": "object", "properties": {}, "additionalProperties": False}},
    {"type": "function", "name": "get_repo_path", "description": "Read a UTF-8 repository file or list a directory on the worker branch.", "parameters": {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"], "additionalProperties": False}},
    {"type": "function", "name": "write_file", "description": "Create or replace one UTF-8 repository file on the worker branch. Maximum eight unique files total.", "parameters": {"type": "object", "properties": {"path": {"type": "string"}, "content": {"type": "string"}, "message": {"type": "string"}}, "required": ["path", "content", "message"], "additionalProperties": False}},
    {"type": "function", "name": "open_pull_request", "description": "Open one pull request from the worker branch to main after making changes.", "parameters": {"type": "object", "properties": {"title": {"type": "string"}, "body": {"type": "string"}}, "required": ["title", "body"], "additionalProperties": False}},
    {"type": "function", "name": "comment_issue", "description": "Post concise execution status, blocker, or result to the assigned GitHub issue.", "parameters": {"type": "object", "properties": {"body": {"type": "string"}}, "required": ["body"], "additionalProperties": False}},
]


def output_text(response: dict) -> str:
    chunks: list[str] = []
    for item in response.get("output", []):
        if item.get("type") != "message":
            continue
        for content in item.get("content", []):
            if content.get("type") == "output_text":
                chunks.append(content.get("text", ""))
    return "\n".join(chunks).strip()


def function_calls(response: dict) -> list[dict]:
    return [item for item in response.get("output", []) if item.get("type") == "function_call"]


def main() -> int:
    repo = os.environ.get("GITHUB_REPOSITORY")
    github_token = os.environ.get("GITHUB_TOKEN")
    api_key = os.environ.get("OPENAI_API_KEY")
    raw_payload = os.environ.get("LUMEN_WAKE_PAYLOAD")
    if not repo or not github_token or not raw_payload:
        raise RuntimeError("GITHUB_REPOSITORY, GITHUB_TOKEN and LUMEN_WAKE_PAYLOAD are required")
    wake = json.loads(raw_payload)
    issue = int(wake["issue"])
    lane = wake["lane"]
    if lane not in LANE_ROLES:
        raise RuntimeError(f"unsupported lane: {lane}")
    if not api_key:
        http_json(
            f"https://api.github.com/repos/{repo}/issues/{issue}/comments",
            github_token,
            "POST",
            {"body": "Execution worker was woken by the controller but cannot run because the repository secret `OPENAI_API_KEY` is not configured."},
        )
        raise RuntimeError("OPENAI_API_KEY is not configured")

    run_id = os.environ.get("GITHUB_RUN_ID", "manual")
    branch = f"worker/{lane}/issue-{issue}-{run_id}"
    tools = GithubTools(repo=repo, token=github_token, issue=issue, lane=lane, branch=branch)
    tools.create_branch()
    issue_data = tools.get_issue()
    prompt = f"""You are the Lumen {LANE_ROLES[lane]}

Wake payload: {json.dumps(wake)}
Assigned issue: {json.dumps(issue_data)}

Operating rules:
- GitHub is the source of truth. Inspect repository files before editing.
- Act on this issue now; do not merely restate it.
- Keep changes bounded to at most {MAX_CHANGED_FILES} unique files.
- Never merge PRs, never alter repository secrets, never scrape ChatGPT sessions, and never claim work happened unless a GitHub artifact exists.
- Preserve Lumen's repository conventions and tests. If implementation is possible, create the smallest coherent change and open a PR. If genuinely blocked by a human/product/credential decision, post one precise issue comment explaining the blocker and required decision.
- Codex is manual-only and must not be invoked.
"""

    request: dict[str, Any] = {
        "model": os.environ.get("LUMEN_WORKER_MODEL", "gpt-5.6-terra"),
        "reasoning": {"effort": "medium"},
        "input": prompt,
        "tools": TOOLS,
    }
    final_text = ""
    for _ in range(MAX_TOOL_ROUNDS):
        response = openai_response(api_key, request)
        final_text = output_text(response) or final_text
        calls = function_calls(response)
        if not calls:
            break
        tool_outputs = []
        for call in calls:
            try:
                arguments = json.loads(call.get("arguments") or "{}")
                result = tools.execute(call["name"], arguments)
            except Exception as exc:  # return tool errors to the model for correction
                result = {"error": str(exc)}
            tool_outputs.append({"type": "function_call_output", "call_id": call["call_id"], "output": json.dumps(result)})
        request = {
            "model": os.environ.get("LUMEN_WORKER_MODEL", "gpt-5.6-terra"),
            "reasoning": {"effort": "medium"},
            "previous_response_id": response["id"],
            "input": tool_outputs,
            "tools": TOOLS,
        }

    if tools.changed_paths and tools.pr_number is None:
        tools.open_pr(
            f"Work issue #{issue}: {wake.get('title', 'Lumen task')}",
            f"Automated bounded execution for #{issue} by the `{lane}` lane worker.\n\nChanged files: {len(tools.changed_paths)}.\n\nThe worker does not merge its own PRs.",
        )
    if tools.pr_number is None and final_text:
        tools.comment(f"Execution worker result:\n\n{final_text[:5000]}")
    print(json.dumps({"issue": issue, "lane": lane, "branch": branch, "changed_files": sorted(tools.changed_paths), "pr": tools.pr_number}))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (RuntimeError, urllib.error.URLError, urllib.error.HTTPError) as exc:
        print(json.dumps({"action": "worker_error", "message": str(exc)}))
        sys.exit(1)
