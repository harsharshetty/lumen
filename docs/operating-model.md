# Lumen Operating Model

GitHub `main` and the approved backlog are the shared source of truth across all Lumen working threads. Chat threads are specialized working surfaces; they coordinate through repository docs, issues, pull requests, CI results, and explicitly recorded priority/quality signals rather than relying on cross-chat memory.

## Project-wide goal

The current north-star goal is to deliver the **first parent-value vertical slice**:

**An adult can authenticate, create a learner, explicitly select one or more supported curricula, reach a learner home/profile, and receive at least one useful curriculum-based learning insight or recommendation.**

The first useful output may be curriculum-based before learner-specific evidence exists, but it must state uncertainty clearly and must not fabricate learner strengths, weaknesses, or mastery.

This goal exists to keep the project focused on visible user value while allowing the engineering, quality, architecture, and UX foundations to mature in parallel.

## Definition of success

Lumen is making meaningful progress when work either moves the first-parent-value slice forward or materially reduces the risk of shipping that slice.

A work item should normally fit at least one of these categories:
- **Moves slice** — directly adds user-visible capability required by the first-parent-value journey.
- **Unblocks slice** — removes a concrete dependency preventing that journey from progressing.
- **Protects slice** — materially reduces security, privacy, correctness, reliability, operability, or maintainability risk for that journey.

Work that fits none of these categories should normally remain deferred unless CTO & Founding Team explicitly approves it.

The first-parent-value slice is considered successful when:
- an authenticated adult can complete the journey end-to-end through the product UI;
- learner access and curriculum authorization are enforced server-side;
- the selected curricula persist correctly against PostgreSQL;
- the useful output is understandable to a parent and does not overstate what is known about the learner;
- the critical journey is protected by automated server-boundary and browser-level behavioral tests;
- the deployed revision is traceable to a CI-verified revision;
- no known P0/P1 security, privacy, learner-data exposure, or data-loss issue remains open for the slice;
- at least one real parent can try the journey and provide feedback on whether the output is genuinely useful.

PR count, issue count, documentation volume, code coverage, or thread activity are not success measures by themselves. The preferred status question is: **what can a parent do today that they could not do before, or what material risk to that journey was removed?**

## Culture and execution principles

- Preserve independent ownership and healthy challenge between threads.
- Prefer the smallest intervention that preserves security, correctness, and approved behavior.
- Do not create governance, ADRs, or backlog merely because a topic can be documented; create them when they resolve material ambiguity, repeated failure modes, or meaningful delivery risk.
- Focused threads may work ahead in parallel when there is no real dependency.
- Avoid speculative WIP. Each focused thread should keep only a small number of active items unless a P0/P1 risk requires otherwise.
- Product Management should optimize for user-value throughput and merge throughput, not activity volume.

## Threads and responsibilities

### CTO & Founding Team

This is the primary product/technology leadership thread.

Owns:
- product direction, product boundaries, and strategic trade-offs;
- architecture and major domain decisions;
- founding-team level prioritization inputs and business context;
- approval of material changes to product semantics, privacy, authorization, data ownership, lifecycle, and system architecture;
- definition and evolution of the first-parent-value goal and success criteria;
- resolution of blockers escalated by Product Management, Platform Architecture, Quality, UX, Codex, or Implementation.

This thread should make decisions, not perform routine implementation work.

### Product Management & Prioritization

Owns backlog sequencing and execution priority.

Responsibilities:
- maintain a clear NOW / NEXT / LATER ordering of implementation-ready backlog;
- consider product value, business urgency, dependency order, implementation readiness, quality risk, and delivery cost;
- explicitly classify active work as `moves slice`, `unblocks slice`, or `protects slice`;
- identify work that can safely proceed in parallel;
- ensure Implementation and Codex do not choose arbitrary backlog items;
- keep the priority view current as PRs merge and dependencies clear;
- reprioritize when critical quality, security, reliability, UX, or architectural risks emerge;
- return product/architecture ambiguity to CTO & Founding Team rather than deciding it locally.

### Implementation & Delivery

Owns hands-on engineering execution on the primary product critical path.

Responsibilities:
- implement the highest-priority ready work selected by Product Management;
- stay focused on the critical path to first parent value unless PM explicitly assigns independent parallel work;
- follow repository architecture, ADRs, AGENTS.md, quality gates, and PR-size/reviewability rules;
- include tests in the same logical implementation sequence;
- surface material ambiguity instead of silently inventing product or architecture behavior;
- keep PRs, issue references, and delivery state current in GitHub.

Implementation must not weaken tests, authorization, or architectural rules merely to make a PR pass.

### Codex / Engineering Execution

Owns well-bounded implementation-ready execution work delegated through GitHub. Codex is an accelerator, not a decision-making authority.

Suitable work includes:
- CI failures and build corrections;
- clearly specified feature slices with approved semantics and acceptance criteria;
- bounded refactors and architecture remediations;
- test infrastructure and persistence/migration work;
- security/build hardening with an approved end state.

Codex handoff contract:
- PM, Implementation, Quality, Platform Architect, or CTO records the target issue/PR, desired outcome, constraints, acceptance criteria, and relevant authoritative docs/ADRs in GitHub;
- Codex reconstructs context from GitHub rather than relying on private chat history;
- Codex works only on branches/PRs and follows AGENTS.md, tests, CI gates, and repository reviewability rules;
- Codex must not invent product semantics, weaken tests/security, or broaden scope merely to get CI green;
- if implementation exposes genuine product/architecture ambiguity, Codex stops that decision locally and records exact evidence plus a recommended escalation in GitHub;
- completion is a concrete GitHub signal: commit/PR update, tests/CI evidence, and a concise summary of what changed and why.

Codex capacity is opportunistic, not guaranteed. A Codex-assigned task must always have a fallback owner. If Codex is unavailable, rate-limited, fails to pick up the work, or cannot continue within the active delivery window, ownership reverts immediately to the appropriate implementation lane rather than allowing the project critical path to idle.

Codex success is measured by safe completed execution and reduced critical-path time, not number of generated commits or tasks attempted.

### Quality, Test Coverage & Verification

Owns independent quality visibility and behavioral protection.

Responsibilities:
- track backend/frontend line and branch coverage, test counts, test mix, CI health, and behavioral/use-case protection;
- distinguish raw code coverage from end-to-end product/use-case coverage;
- derive behavioral/E2E scenarios from approved CTO/Product decisions;
- prioritize protection of the first-parent-value journey and its security/privacy boundaries;
- create backlog items for missing tests, regressions, weakly protected behavior, or authorization gaps;
- verify implemented behavior independently of Implementation and Codex;
- escalate material regressions to Product Management for reprioritization.

Quality must not invent product semantics. Ambiguous behavior returns to CTO & Founding Team. Quality should prefer the smallest test or gate that protects the intended behavior rather than creating ceremony for its own sake.

### Platform Architect

Owns continuous architecture and engineering-practice conformance review.

Responsibilities:
- inspect merged code, active PRs, repository structure, dependency choices, APIs, persistence, security boundaries, tests, CI/CD, and operational setup;
- compare implementation against established software-engineering principles, relevant design patterns, framework idioms, security practices, maintainability expectations, and the approved Lumen architecture;
- identify deviations such as misplaced responsibilities, leaky abstractions, inappropriate coupling, duplicated domain logic, broken layering, transactional mistakes, unsafe persistence patterns, poor API boundaries, inadequate observability, security smells, unnecessary complexity, framework misuse, or avoidable technical debt;
- distinguish an intentional architectural trade-off from an accidental deviation;
- create GitHub backlog items for concrete violations or debt with severity, rationale, evidence, expected end state, and acceptance criteria;
- distinguish issues that materially protect the first-parent-value slice from opportunistic debt;
- notify Product Management when an architectural issue should pre-empt feature work;
- escalate any finding that requires a product or architecture decision to CTO & Founding Team rather than silently redefining the architecture.

The Platform Architect is an independent reviewer, not a second implementation agent by default. It may implement dependency-safe remediation when explicitly assigned, but should avoid generating speculative debt backlog that does not materially affect the product path.

### UX & Product Design

Owns the concrete interaction design for approved product behavior.

Responsibilities:
- turn approved product semantics into user journeys, information architecture, screen states, interaction rules, copy guidance, responsive behavior, and accessibility expectations;
- work ahead of implementation on dependency-safe UX so frontend delivery is not blocked by avoidable design ambiguity;
- validate mockups and interaction artifacts against approved semantics before handoff;
- convert design decisions into GitHub-backed implementation contracts rather than leaving them only in chat or images;
- test whether the first-parent-value journey is understandable and useful to real parents;
- escalate product ambiguity to CTO & Founding Team rather than inventing new domain behavior.

UX success is not the number of mockups produced. It is reduction of user-facing ambiguity and evidence that the parent journey is understandable and useful.

## Coordination loop

1. CTO & Founding Team defines approved product and architecture behavior, the current first-parent-value goal, and material decisions in `/docs` and ADRs.
2. UX turns approved behavior into implementation-ready interaction contracts and validates the journey with users where practical.
3. Quality derives behavioral protection needs and creates quality backlog where needed.
4. Platform Architect reviews architecture/design-pattern/practice conformance and creates remediation backlog for material deviations.
5. Product Management evaluates feature, UX, quality, platform-architecture, security, and operational backlog together, classifies active work against the first-parent-value slice, and sets NOW / NEXT / LATER priority.
6. Implementation owns the primary critical path; Codex and other explicitly assigned lanes execute additional dependency-safe work in parallel through GitHub handoffs.
7. Quality verifies behavioral correctness and regression protection independently of whichever execution lane produced the change.
8. Platform Architect reviews architectural integrity and maintainability of the resulting implementation.
9. Product Management reprioritizes based on delivery progress, merged work, and findings.
10. Any material ambiguity returns to CTO & Founding Team with a concrete recommendation rather than a blank-slate question.

## Escalation rules

- Security/privacy violations, learner-data exposure, authorization bypasses, data-loss risks, and broken critical invariants are P0/P1 candidates and may pre-empt feature delivery.
- Architectural debt should not automatically block delivery. Platform Architect should classify severity and explain whether remediation is blocking, near-term, or opportunistic.
- Well-established patterns are guidance, not dogma. A deviation is not a defect when Lumen has an explicit, documented reason and the trade-off is acceptable.
- Product Management controls execution priority; Platform Architect, Quality, and UX supply risk/readiness signals but do not independently reorder the implementation queue.
- Implementation and Codex may choose technical details within approved boundaries, but may not decide material product semantics or architecture policy.
- A thread should not block another thread merely because its own work is incomplete; only real dependencies or material risk should block parallel progress.
- A GitHub handoff to Codex is not considered active execution until a concrete execution signal exists (for example a branch/commit/PR update or an explicit blocker posted by the Codex lane). Recording the handoff alone is not progress.
- Codex unavailability, rate limits, or exhausted usage windows must never leave critical-path work ownerless. The fallback owner resumes immediately unless PM explicitly assigns another execution lane.

## Source of truth

Repository artifacts are canonical for cross-thread coordination:
- `/docs` and ADRs: approved product/architecture intent and the current project-wide goal;
- GitHub issues: implementation, Codex handoffs, UX, quality, architectural-remediation, and operational backlog;
- priority annotations/status maintained by Product Management: execution order and relation to first-parent-value;
- pull requests and `main`: implementation state;
- CI/test reports: objective quality state.

A thread should be able to reconstruct the current Lumen state from GitHub without requiring private context from another chat thread.
