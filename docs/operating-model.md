# Lumen — Coordinated Delivery Operating Model

## Purpose

Lumen is run through multiple ChatGPT workstreams that must remain coordinated without relying on cross-thread conversational memory. GitHub is the shared control plane and source of truth for backlog, priority, implementation state, quality findings, and approved product/architecture decisions.

## Workstreams

### Architecture & Product Design
Owns product behavior and architecture.

Responsibilities:
- define approved user journeys, domain rules, permissions, invariants, UX behavior, and architectural decisions;
- record material decisions in `/docs` and ADRs;
- create or refine implementation-ready backlog items when behavior is unambiguous;
- resolve product/design ambiguities escalated from Product Management, Implementation, or Quality.

Must not:
- choose implementation sequencing except where a dependency is architectural;
- weaken behavior to accommodate an implementation shortcut;
- let chat become a competing source of truth.

### Product Management & Prioritization
Owns delivery sequencing.

Responsibilities:
- use open GitHub backlog plus current implementation/quality state to maintain the delivery priority;
- maintain a clear `NOW / NEXT / LATER` view;
- prioritize using product value, dependency order, implementation readiness, quality risk, and business urgency;
- identify work that can safely proceed in parallel;
- nominate the single next implementation item when Implementation asks what to work on;
- reprioritize when Quality identifies material regression risk or missing behavioral protection.

Must not:
- redefine product behavior, permissions, or architecture;
- invent acceptance criteria that conflict with approved design;
- allow Implementation to choose arbitrary feature work outside the current priority.

### Implementation & Delivery
Owns execution.

Responsibilities:
- pick work from the current Product Management priority, not arbitrarily from the backlog;
- implement the approved issue scope and acceptance criteria;
- create focused PRs that follow repository limits and CI requirements;
- update issue/PR status so Product Management and Quality can observe progress from GitHub;
- stop and escalate when implementation exposes a material ambiguity in approved behavior or architecture.

Must not:
- silently change product behavior;
- bypass Product Management sequencing except for a release-blocking defect/CI failure or explicit urgent reprioritization;
- weaken or remove tests merely to make a PR pass.

### Quality, Test Coverage & Verification
Owns independent quality visibility and behavioral protection.

Responsibilities:
- track backend/frontend line and branch coverage, test counts, test-type distribution, CI health, and regressions;
- distinguish raw code coverage from behavioral/use-case coverage;
- derive behavioral/E2E scenarios from approved Architecture & Product Design use cases and invariants;
- create and maintain test backlog items for missing behavioral protection;
- report material quality risk to Product Management for reprioritization;
- verify merged functionality against the approved behavioral matrix.

Must not:
- invent new product behavior in tests;
- treat 100% line/branch coverage as equivalent to complete behavioral protection;
- silently reinterpret ambiguous acceptance behavior; ambiguity goes back to Architecture & Product Design.

## Shared coordination loop

1. **Architecture/Product defines behavior.** Approved behavior is recorded in `/docs`, ADRs, and implementation-ready GitHub issues.
2. **Quality derives protection.** Quality converts those approved use cases into a behavioral/E2E test matrix and creates implementation backlog items for missing test coverage.
3. **Product Management sequences work.** PM reads the feature backlog, quality backlog, dependencies, CI state, and business urgency and publishes the current `NOW / NEXT / LATER` priority.
4. **Implementation executes NOW.** Implementation picks the highest-priority ready item(s), opens PRs, runs required tests, and keeps GitHub status current.
5. **Quality verifies.** Quality inspects merged changes/CI and updates coverage, use-case protection, regressions, and gaps.
6. **PM reacts to quality.** Release-blocking regressions or materially unprotected critical journeys can pre-empt feature work.
7. **Ambiguity loops back to Architecture/Product.** No other workstream resolves material product/architecture ambiguity on its own.

## GitHub coordination contract

GitHub, not chat history, is the authoritative cross-thread interface.

Each implementation issue should contain:
- objective and scope;
- dependencies;
- approved behavior/invariants;
- acceptance criteria;
- non-goals;
- quality ownership notes where relevant.

Product Management should express priority using issue numbers and explicit state (`NOW`, `NEXT`, `LATER`).

Implementation should make progress observable through issue/PR state and should link PRs to the issue they implement.

Quality should create separate test-backlog issues when behavioral protection is missing rather than hiding those requirements in chat-only notes.

Architecture/Product should update the canonical docs/ADR when an approved decision changes and then reconcile affected backlog items.

## Priority and interruption rules

Default order of precedence:
1. release-blocking defect, security/privacy regression, failing required CI, or broken critical E2E;
2. current Product Management `NOW` item(s);
3. `NEXT` items whose dependencies are satisfied;
4. `LATER` items.

Implementation may not self-promote a `LATER` item because it is easier or more interesting.

Quality findings do not automatically reorder work; they are surfaced to Product Management, which owns the reprioritization decision. A clearly release-blocking security/privacy or critical-regression finding should be treated as urgent immediately.

## Parallel work

Product Management may place multiple issues in `NOW` only when they can proceed safely in parallel without conflicting domain/schema assumptions or dependent sequencing.

Quality/E2E infrastructure may proceed in parallel with feature work when it does not require unfinished product behavior.

## Definition of coordinated state

The operating model is healthy when:
- Architecture/Product behavior is documented and backlog-ready;
- Product Management has a current priority view;
- Implementation is working only on prioritized ready items;
- Quality has visibility into current coverage and behavioral protection;
- important quality gaps exist as visible backlog items;
- all threads can reconstruct the current state from GitHub without relying on another thread's conversational context.
