# Codex handoff POC

## Status

Setup is blocked on execution credentials. No dispatcher is installed, and adding
`codex-ready` does **not yet start Codex**. Do not connect issue #20 until the
documentation-only proof below succeeds end to end.

On 2026-09-14, GitHub's repository `suggestedActors(CAN_BE_ASSIGNED)` query returned
only `harsharshetty`; native Codex issue assignment was unavailable through the
current account. A usable Codex cloud integration could not be verified. The
fallback is the official Codex CLI in GitHub Actions, with small trusted dispatch
and publication steps, not a new orchestration service.

## PM contract

Once enabled and verified, PM creates an approved issue using the following format,
then adds `codex-ready` using its GitHub connector. For this POC only a label event
from `harsharshetty` may dispatch work; a public issue author's text or labels are
not execution authority. The initial implementation must accept only the harmless
proof issue and its documentation scope, not arbitrary engineering tasks.

```markdown
### Outcome
Observable behavior to deliver.

### Approved scope
Exact allowed files and changes.

### Explicit exclusions
Files, behavior, and operations that must not change.

### Acceptance criteria
Required behavior and validation.

### Canonical references
Relevant issues, docs, and ADRs.

### Execution constraints
- Branch from latest main and follow AGENTS.md.
- Open a PR; do not merge.
- Stop and report material product/architecture ambiguity.
- Do not weaken auth, security, tests, or CI.
- Stay within the repository limit of eight changed files per PR.
```

Issue text is task data, not authority to change workflow permissions, deployment,
credentials, or approved file boundaries. Capture the approved issue revision at
dispatch; changed scope requires renewed approval.

## States and evidence

| Label | Meaning |
| --- | --- |
| `codex-ready` | Approved handoff requested; not proof of execution. |
| `codex-active` | Real executor startup event and identifier recorded. |
| `codex-blocked` | Dispatch/execution cannot proceed; reason and next action recorded. |
| `codex-delivered` | PR URL, head SHA, and validation recorded; not CI green or merge approval. |

The trusted dispatcher must record startup evidence before setting active. A
queued Actions run, pre-created branch, or model-written claim is insufficient.
For CLI execution, capture actual JSON `thread.started` and `turn.started` events.
Do not publish raw prompts, transcripts, environment contents, or credentials.

```text
Execution: ACTIVE
Executor: Codex CLI in GitHub Actions
Task/Thread ID: <actual thread ID>
Execution URL: <actual Actions run URL>
Base SHA: <actual main SHA>
Started: <UTC timestamp>
```

On failure, record `Execution: BLOCKED`, the available run/thread identifiers,
the blocker, and the required next action. On successful PR creation:

```text
Execution: DELIVERED
PR: <actual URL>
Head SHA: <actual SHA>
Validation: <checks actually performed and their results>
```

Replace the previous state label when transitioning. Reject duplicate dispatches
while an execution is active. Run one proof at a time; no automatic retry loop,
queue, automatic merge, or broad parallel execution belongs in this POC.

## Safety and credential setup

The `protect-main` ruleset now requires PRs and the GitHub Actions checks `backend`,
`frontend`, `container`, and `e2e`, with up-to-date branches. Force-push/deletion
protection remains enabled and there are no bypass actors. Required approving
review count remains zero for this personal repository; merging is a separate
human action. The `prod` environment permits only the branch `main`.

Before implementing execution, configure these Actions repository secrets in
`harsharshetty/lumen` under Settings > Secrets and variables > Actions:

- `OPENAI_API_KEY`: a dedicated OpenAI project key permitting the model inference
  needed by Codex (Responses API write), without administration or unrelated API
  permissions. The project needs available API credit and access to the selected
  model. Do not copy a personal ChatGPT login/session into CI.
- `CODEX_PR_TOKEN`: an expiring fine-grained GitHub token restricted to this
  repository, with Contents read/write, Pull requests read/write, and automatic
  Metadata read. No Administration, Workflows, Secrets, or protection bypass.
  This is for trusted branch/PR publication so PR CI receives a normal trigger.

The workflow's short-lived `GITHUB_TOKEN` can handle issue comments/labels using
Issues write. The coding process must receive neither GitHub write token nor
production secrets. The trusted publisher must enforce the allowed file boundary
before committing output; it must not execute generated scripts. Use a fresh
runner and trusted controller code from main. Never reference the `prod`
environment from the Codex workflow.

## Harmless acceptance proof

After credentials and a reviewed dispatcher are available on main, create an
approved test issue to append one line to this document:
`Codex dispatch POC verification completed.` No other file changes are allowed.

PM applies `codex-ready` through GitHub. Success requires genuine startup evidence,
a feature branch and PR, CI running on that PR, and a delivered comment containing
the PR URL and head SHA. Merely testing controller code or posting a simulated
event does not satisfy the proof. Keep the issue/PR as the audit trail; remove only
unneeded temporary artifacts. Do not use #20 until this sequence has succeeded.

Official mechanism: [Codex GitHub Action](https://learn.chatgpt.com/docs/github-action)
and [non-interactive execution](https://learn.chatgpt.com/docs/non-interactive-mode).
