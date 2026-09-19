# Lumen Operating Model

GitHub `main`, approved `/docs` and ADRs, active issues/PRs, and CI results are the shared source of truth across all Lumen working threads. Chat threads are specialized working surfaces. They must coordinate through durable repository signals rather than private cross-chat memory.

## Project-wide goal

The current north star is the **first-parent-value vertical slice**:

**An adult can authenticate, create a learner, explicitly select one or more supported curricula, reach a learner home/profile, and receive at least one useful curriculum-based learning insight or recommendation.**

The first useful output may be curriculum-based before learner-specific evidence exists, but it must state uncertainty clearly and must not fabricate learner strengths, weaknesses, or mastery.

A work item should normally do at least one of the following:
- **Moves slice** — directly adds user-visible capability required by the first-parent-value journey.
- **Unblocks slice** — removes a concrete dependency preventing that journey from progressing.
- **Protects slice** — materially reduces security, privacy, correctness, reliability, operability, or maintainability risk for that journey.

PR count, issue count, documentation volume, code coverage, or thread activity are not success measures by themselves. The preferred progress question is: **what can a parent do today that they could not do before, or what material risk to that journey was removed?**

## Managed lanes

The autonomous operating model contains five managed lanes plus this supervisory control plane:

1. Product Management & Prioritization
2. Implementation & Delivery
3. Quality, Test Coverage & Verification
4. Platform Architect
5. UX & Product Design

The CTO & Founding Team thread remains the decision authority for material product, architecture, privacy, authorization, data-ownership, and lifecycle decisions.

### Codex handling

Codex is **not** an autonomous lane in the operating model for now. It is an optional manual execution accelerator only when the user explicitly hands a bounded task to Codex.

Normal delivery must never depend on Codex availability, pickup, quotas, or rate limits. A Codex candidate remains owned by the appropriate managed lane until the user explicitly confirms the manual handoff. If Codex becomes unavailable, ownership immediately remains with or returns to the managed lane. The operating-model supervisor must not monitor Codex as a standing lane or treat a GitHub handoff note as active Codex execution.

## Lane responsibilities

### Product Management & Prioritization

Owns sequencing and execution priority.

Responsibilities:
- maintain a current NOW / NEXT / LATER view;
- classify active work as `moves slice`, `unblocks slice`, or `protects slice`;
- react when dependencies clear, PRs merge, blockers emerge, or priorities materially change;
- identify safe parallelism and prevent arbitrary backlog selection;
- ensure the primary critical path always has an owner and next observable checkpoint;
- return product/architecture ambiguity to CTO & Founding Team rather than deciding it locally.

PM success is not a successful handoff. PM owns end-to-end flow of prioritized backlog until value or required risk reduction lands.

### Implementation & Delivery

Owns hands-on engineering execution on the primary product critical path.

Responsibilities:
- implement the highest-priority ready work selected by PM;
- keep the critical path moving unless a genuine dependency or material risk blocks it;
- follow architecture, ADRs, AGENTS.md, quality gates, and repository reviewability rules;
- include tests in the same logical implementation sequence;
- surface material ambiguity instead of inventing product or architecture behavior;
- keep branch, PR, issue, CI, and blocker state current in GitHub.

Implementation must not weaken tests, authorization, security, or architectural rules merely to make CI green.

### Quality, Test Coverage & Verification

Owns independent behavioral protection and release confidence.

Responsibilities:
- verify intended behavior independently of the execution lane;
- distinguish raw code coverage from useful behavioral protection;
- prioritize negative authorization/privacy/security cases on the first-parent-value journey;
- create concrete quality backlog only where missing protection materially matters;
- block unsafe behavior with precise evidence and an explicit resolution path;
- avoid blocking on taste, ceremony, or speculative completeness.

Quality must not invent product semantics. Ambiguity returns to CTO & Founding Team.

### Platform Architect

Owns independent architecture, security, and engineering-practice conformance review.

Responsibilities:
- inspect merged code and active PRs for material architectural/security/operability risk;
- distinguish intentional trade-offs from accidental deviations;
- create remediation backlog with severity, evidence, expected end state, and acceptance criteria;
- identify whether remediation is blocking, near-term, or opportunistic;
- provide a concrete resolution path when blocking work;
- avoid speculative debt generation that does not materially protect the product path.

Platform Architect is not a second implementation lane by default.

### UX & Product Design

Owns interaction design for approved product behavior.

Responsibilities:
- turn approved semantics into implementation-ready journeys, screen states, copy, accessibility, and interaction rules;
- work ahead when dependencies allow without inventing product semantics;
- persist implementation contracts in GitHub rather than leaving them only in chat/images;
- validate whether the first-parent-value journey is understandable and useful to real parents;
- escalate domain ambiguity to CTO & Founding Team.

## Operating rules

### 1. Ownership requires an observable signal

An item is not considered actively progressing merely because a lane has been named as owner or a handoff comment exists.

Every active item must have a next observable execution signal, such as:
- branch or commit movement;
- PR creation/update;
- CI run;
- review/verification result;
- implementation-ready UX contract;
- explicit blocker with evidence and recommended resolution.

If an unblocked active lane repeatedly produces no observable signal, that is an operating-model failure and should be surfaced by the supervisor.

### 2. Handoff is not completion

A lane that hands work to another lane still owns the outcome appropriate to its role. In particular, PM's responsibility does not end when work is assigned. PM must continue to track whether the prioritized outcome actually progresses and react when it does not.

Receiving lanes should not wait for repeated nudges once a dependency is clear and their work is implementation-ready.

### 3. Parallel development, serialized final merge window

Lanes may develop, review, and run CI in parallel whenever dependencies allow.

When the PM-designated critical-path PR becomes green or enters its final refresh-to-`main` cycle, a **critical-path merge window** begins:
- other lanes may continue coding, reviewing, and running CI;
- non-critical PRs temporarily do not merge to `main` if doing so would invalidate the critical-path PR under protected-main freshness rules;
- the window ends when the critical-path PR merges or becomes genuinely blocked;
- the purpose is to serialize only the final integration step, not parallel development.

This prevents merge starvation while retaining parallel throughput.

### 4. Blocking requires a resolution path

Quality or Platform may block unsafe work, but every block must state:
- the concrete risk or violated invariant;
- evidence;
- the smallest acceptable resolution or materially distinct options;
- whether the block is release-critical or can be sequenced later.

A block without a concrete path forward is itself a coordination defect.

### 5. Cleared dependencies must trigger action

When a dependency clears, the responsible lane should act without waiting for the user to ask for status. PM must keep sequencing current, and the newly unblocked lane should produce an observable execution signal.

### 6. No duplicate execution

One bounded implementation problem should have one active execution owner. Other lanes may review, verify, or prepare dependency-safe follow-on work, but should not independently implement the same fix unless ownership is explicitly reassigned.

### 7. Source-of-truth drift is a defect

A thread must be able to reconstruct current Lumen state from GitHub. If chat guidance, stale branches, issue bodies, PR descriptions, or `/docs` disagree materially with `main` and approved decisions, the drift should be corrected rather than carried as implicit context.

## Operating-model supervisor

The CTO/founding operating-model thread acts as the supervisor of the system, not as another PM or implementation lane.

It watches for systemic failures including:
- unblocked lanes with no progress signal;
- PM failing to react to repo state;
- duplicate execution;
- stale handoffs between managed lanes;
- blockers without resolution paths;
- cleared dependencies with no pickup;
- merge starvation;
- source-of-truth drift;
- a lane repeatedly failing to perform its defined responsibility.

The supervisor should fix mechanisms and contracts, not routinely manage the backlog or perform implementation work. It should stay quiet when the operating model is healthy.

## Coordination loop

1. CTO & Founding Team defines approved product/architecture behavior and material decisions.
2. UX turns approved behavior into implementation-ready interaction contracts where useful.
3. Quality derives the smallest meaningful behavioral protection needed.
4. Platform Architect surfaces material architecture/security/operability risks.
5. PM combines those signals into a current execution sequence and identifies safe parallelism.
6. Implementation executes the primary critical path; other managed lanes progress dependency-safe work in parallel.
7. Quality verifies behavior independently.
8. Platform Architect verifies material architectural integrity.
9. PM reacts to merged work, cleared dependencies, or findings without waiting for manual prompting.
10. The supervisor intervenes only when the coordination system itself is failing.
11. Material ambiguity returns to CTO & Founding Team with evidence and a recommendation.

## Escalation principles

- Security/privacy violations, learner-data exposure, authorization bypasses, data-loss risks, and broken critical invariants are P0/P1 candidates and may pre-empt feature delivery.
- Architectural debt does not automatically block delivery; severity and timing must be explicit.
- A thread should not block another thread merely because its own work is incomplete; only real dependencies or material risk should block parallel progress.
- Prefer the smallest intervention that preserves security, correctness, and approved behavior.
- Avoid governance, ADRs, or backlog created merely because something can be documented.

## Source of truth

Repository artifacts are canonical for cross-thread coordination:
- `/docs` and ADRs: approved product/architecture intent and operating rules;
- GitHub issues: product, implementation, UX, quality, architecture, and operational backlog;
- PM priority view: execution order and relation to first-parent-value;
- pull requests and `main`: implementation state;
- CI/test reports: objective quality state.

The operating model is working when specialized lanes can proceed autonomously from these signals and the user does not need to repeatedly ask them to notice obvious state changes.