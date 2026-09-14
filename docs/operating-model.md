# Lumen Operating Model

GitHub `main` and the approved backlog are the shared source of truth across all Lumen working threads. Chat threads are specialized working surfaces; they coordinate through repository docs, issues, pull requests, CI results, and explicitly recorded priority/quality signals rather than relying on cross-chat memory.

## Threads and responsibilities

### CTO & Founding Team

This is the primary product/technology leadership thread.

Owns:
- product direction, product boundaries, and strategic trade-offs;
- architecture and major domain decisions;
- founding-team level prioritization inputs and business context;
- approval of material changes to product semantics, privacy, authorization, data ownership, lifecycle, and system architecture;
- resolution of blockers escalated by Product Management, Platform Architecture, Quality, or Implementation.

This thread should make decisions, not perform routine implementation work.

### Product Management & Prioritization

Owns backlog sequencing and execution priority.

Responsibilities:
- maintain a clear NOW / NEXT / LATER ordering of implementation-ready backlog;
- consider product value, business urgency, dependency order, implementation readiness, quality risk, and delivery cost;
- identify work that can safely proceed in parallel;
- ensure Implementation does not choose arbitrary backlog items;
- reprioritize when critical quality, security, reliability, or architectural risks emerge;
- return product/architecture ambiguity to CTO & Founding Team rather than deciding it locally.

### Implementation & Delivery

Owns hands-on engineering execution.

Responsibilities:
- implement the highest-priority ready work selected by Product Management;
- follow repository architecture, ADRs, AGENTS.md, quality gates, and PR-size rules;
- include tests in the same logical implementation sequence;
- surface material ambiguity instead of silently inventing product or architecture behavior;
- keep PRs, issue references, and delivery state current in GitHub.

Implementation must not weaken tests, authorization, or architectural rules merely to make a PR pass.

### Quality, Test Coverage & Verification

Owns independent quality visibility and behavioral protection.

Responsibilities:
- track backend/frontend line and branch coverage, test counts, test mix, CI health, and behavioral/use-case protection;
- distinguish raw code coverage from end-to-end product/use-case coverage;
- derive behavioral/E2E scenarios from approved CTO/Product decisions;
- create backlog items for missing tests, regressions, weakly protected behavior, or authorization gaps;
- verify implemented behavior independently of Implementation;
- escalate material regressions to Product Management for reprioritization.

Quality must not invent product semantics. Ambiguous behavior returns to CTO & Founding Team.

### Platform Architect

Owns continuous architecture and engineering-practice conformance review.

Responsibilities:
- inspect merged code, active PRs, repository structure, dependency choices, APIs, persistence, security boundaries, tests, CI/CD, and operational setup;
- compare implementation against established software-engineering principles, relevant design patterns, framework idioms, security practices, maintainability expectations, and the approved Lumen architecture;
- identify deviations such as misplaced responsibilities, leaky abstractions, inappropriate coupling, duplicated domain logic, broken layering, transactional mistakes, unsafe persistence patterns, poor API boundaries, inadequate observability, security smells, unnecessary complexity, framework misuse, or avoidable technical debt;
- distinguish an intentional architectural trade-off from an accidental deviation;
- create GitHub backlog items for concrete violations or debt with severity, rationale, evidence, expected end state, and acceptance criteria;
- notify Product Management when an architectural issue should pre-empt feature work;
- escalate any finding that requires a product or architecture decision to CTO & Founding Team rather than silently redefining the architecture.

The Platform Architect is an independent reviewer, not a second implementation agent. It should normally create remediation backlog rather than directly rewriting implementation unless explicitly asked.

## Coordination loop

1. CTO & Founding Team defines approved product and architecture behavior and records material decisions in `/docs` and ADRs.
2. Quality derives behavioral protection needs and creates quality backlog where needed.
3. Platform Architect reviews architecture/design-pattern/practice conformance and creates remediation backlog for material deviations.
4. Product Management evaluates feature, quality, platform-architecture, security, and operational backlog together and sets NOW / NEXT / LATER priority.
5. Implementation executes the highest-priority ready item(s) and updates GitHub through branches/PRs.
6. Quality verifies behavioral correctness and regression protection.
7. Platform Architect reviews architectural integrity and maintainability of the resulting implementation.
8. Product Management reprioritizes based on delivery progress and findings.
9. Any material ambiguity returns to CTO & Founding Team with a concrete recommendation rather than a blank-slate question.

## Escalation rules

- Security/privacy violations, learner-data exposure, authorization bypasses, data-loss risks, and broken critical invariants are P0/P1 candidates and may pre-empt feature delivery.
- Architectural debt should not automatically block delivery. Platform Architect should classify severity and explain whether remediation is blocking, near-term, or opportunistic.
- Well-established patterns are guidance, not dogma. A deviation is not a defect when Lumen has an explicit, documented reason and the trade-off is acceptable.
- Product Management controls execution priority; Platform Architect and Quality supply risk signals but do not independently reorder the implementation queue.
- Implementation may choose technical details within approved boundaries, but may not decide material product semantics or architecture policy.

## Source of truth

Repository artifacts are canonical for cross-thread coordination:
- `/docs` and ADRs: approved product/architecture intent;
- GitHub issues: implementation, quality, architectural-remediation, and operational backlog;
- priority annotations/status maintained by Product Management: execution order;
- pull requests and `main`: implementation state;
- CI/test reports: objective quality state.

A thread should be able to reconstruct the current Lumen state from GitHub without requiring private context from another chat thread.
