# Lumen — Agent Working Agreement

This repository is implemented by AI agents under human architectural and product direction.

## Roles

- **Product owner / architect:** Harsha. Makes product, architecture, and design decisions. Does not perform routine coding or setup work.
- **Architecture partner / control plane:** ChatGPT. Harsha interacts here as the primary interface. ChatGPT helps evaluate trade-offs, records architectural decisions, creates implementation tasks in GitHub, reviews agent output, and maintains design intent.
- **Implementation & Delivery lane:** Codex. Performs repository setup, backend/product coding, tests, CI/CD, deployment, integration work, and implementation changes from GitHub/Codex Cloud tasks.
- **UX & Product Design delivery lane:** May independently implement frontend-only UX slices that are already grounded in approved product semantics and an implementation-ready UX contract. This lane owns React/Material UI presentation, interaction states, responsive behavior, accessibility, copy, and frontend tests. It must not invent product semantics, expose unsecured product capability, or create fake production backends while waiting for real APIs.
- **Editor:** Zed is optional for inspection of local files and diffs. Harsha should not be required to use Zed as a second conversational control surface.

## Working model

1. Harsha discusses product, architecture, and design decisions with ChatGPT.
2. ChatGPT records approved decisions in `/docs` and converts implementation work into GitHub issues/PR task context.
3. Implementation & Delivery and UX & Product Design may work in parallel when their scopes are dependency-safe. UX may build reusable, production-safe frontend slices against isolated typed fixtures/mocks before backend APIs exist; backend/API integration remains a separate handoff step.
4. Coding agents consume repository context (`AGENTS.md`, `/docs`, issue/PR instructions), work on dedicated feature branches, run tests, and update PRs.
5. ChatGPT reviews the resulting GitHub changes and reports back to Harsha here.
6. Harsha should not need to copy prompts between ChatGPT and coding agents or copy agent output back into ChatGPT.

## Operating principles

1. Treat `/docs` as the canonical source for product and architecture decisions.
2. Do not invent new architecture when an ADR or architecture document already covers the topic.
3. When implementation requires a new architectural decision, stop and surface the decision rather than silently choosing a materially different direction.
4. Prefer the simplest architecture that supports the current product hypothesis.
5. Start as a modular monolith. Do not introduce microservices, messaging infrastructure, graph databases, vector databases, or agent frameworks unless there is a demonstrated product or technical need.
6. Keep LLM providers behind an application abstraction. Domain logic and persisted learning state must not depend on one model vendor.
7. Learning concepts such as Division, Fractions, and Multiplication are data instances, not separate domain classes.
8. Preserve a clear separation between deterministic application/domain state and probabilistic AI interpretation.
9. Every implementation PR must include its tests in the same PR.
10. Backend and frontend application code must maintain 100% line and branch coverage; CI must fail if either falls below 100%.
11. Coverage is a floor, not a substitute for meaningful assertions, edge-case testing, and invariant validation.
12. Prefer Lombok for Java boilerplate such as getters, setters, and no-args constructors where it does not obscure domain intent or create an unsuitable constructor/API shape.
13. Keep commits focused and readable.
14. Keep the canonical domain class diagram in `docs/domain-model.md` synchronized with domain-model changes.
15. Keep detailed engineering rules in focused documents under `/docs`; keep this file concise and link to those documents instead of duplicating detailed guidance here.
16. A UX mockup is not implementation authority by itself. UX implementation must be traceable to approved product semantics and a concrete GitHub UX contract; unsupported mockup-only behavior must not be implemented.

## Git and deployment workflow

1. `main` is the only deployable branch and the only branch from which production/cloud deployment may run.
2. No implementation agent or human should push commits directly to `main`.
3. Every change must start from the latest `main` on a dedicated branch.
4. All changes must return to `main` through a pull request.
5. CI must run on pull requests before merge.
6. Deployment workflows must trigger only from `main` after a successful merge (or by an explicit manual workflow dispatch that deploys the `main` revision only).
7. Branch protection/rulesets should enforce the above policy at GitHub level, not rely only on convention.
8. No coding agent may bypass branch protection, force-push `main`, or merge around failing required checks.
9. A pull request must change no more than **8 files**. If a logical change would exceed 8 files, split it into a sequence of smaller, independently reviewable PRs. Do not use generated or mechanical changes as a reason to bypass this limit without explicit approval from Harsha.

## Current stack direction

- Backend: Java 21 + Spring Boot
- Frontend: React + TypeScript
- UI: Material UI
- Database: PostgreSQL
- API: REST initially
- Architecture: modular monolith

Before implementing significant changes, read:

- `docs/product-principles.md`
- `docs/architecture.md`
- `docs/architecture-conventions.md`
- `docs/domain-model.md`
- `docs/decisions/ADR-001-tech-stack.md`
