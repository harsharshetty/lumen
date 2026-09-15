# Thread execution controller

Issue #121 introduces an external wake-up loop for Lumen's specialist execution lanes. GitHub remains the source of truth; the controller is deliberately not a second PM.

## Trigger

`.github/workflows/thread-execution-controller.yml` runs every five minutes and also supports `workflow_dispatch`. Manual runs default to dry-run. The scheduled run evaluates open GitHub issues and wakes at most one highest-priority stale dependency-ready item per lane.

A candidate must:
- declare a known lane under `## Owner`;
- be older than the configured stale threshold (15 minutes by default);
- not carry `blocked` or `hold` labels;
- not declare an open `Depends on #N` / `Blocked by #N` dependency.

P0/critical/blocker work sorts ahead of normal work. Pull requests are never treated as lane work items.

## Wake adapter

The controller never scrapes ChatGPT sessions or browser credentials. Actual invocation is behind an authenticated webhook adapter:

- `LUMEN_WAKE_WEBHOOK_URL` — supported external execution/thread wake endpoint.
- `LUMEN_WAKE_WEBHOOK_TOKEN` — optional bearer credential for that endpoint.

The payload contains the repository, lane, issue, title, URL and a compact instruction to execute the next GitHub artifact.

If no supported wake endpoint is configured, scheduled execution logs `adapter_unconfigured` and does not fake a wake. This is the current explicit integration boundary for connecting the existing ChatGPT specialist threads (or another approved execution worker) when a supported authenticated interface is available.

## Suppression and auditability

After a successful wake, the controller adds a machine-readable marker comment to the issue. Further wakes for that item are suppressed for 30 minutes by default. Every decision is emitted as a single JSON log record with one of: `idle`, `would_wake`, `wake`, `suppress`, `adapter_unconfigured`, or `error`.

This keeps repeated timer runs state-aware and auditable without introducing another database.

## Failure and retry

GitHub Actions provides the timer/retry surface. A network/API/controller error fails that run; the next scheduled run retries naturally. A rejected wake adapter call does not write the suppression marker, so the item remains eligible for a later retry. A successful call writes the marker only after the adapter returns successfully.

## Dry-run and manual verification

Run the workflow manually with `dry_run=true`. It will evaluate live GitHub state and log which lane/issue would be woken without invoking the adapter or writing markers.

Unit decision tests run both in normal CI and at the start of every scheduled controller run.

## Disable / emergency stop

Disable the `Thread execution controller` workflow in GitHub Actions, or remove/blank the wake-adapter secret to prevent external invocation while retaining decision logs. For a temporary item-level stop, add the `hold` or `blocked` label.

## Deliberate limitations of the first slice

The first slice establishes the independent five-minute timer, candidate selection, dependency gating, priority ordering, suppression, auditing, tests and secure adapter boundary. The final #121 acceptance criterion—demonstrating a dormant Lumen ChatGPT thread itself being externally invoked and then moving a GitHub artifact—requires a supported authenticated thread-invocation endpoint to be connected through the adapter. GitHub comments alone are not treated as evidence that a dormant ChatGPT thread was woken.
