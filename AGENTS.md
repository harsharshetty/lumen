# Lumen — Agent Working Agreement

This repository is implemented by AI agents under human architectural and product direction.

## Roles

- **Product owner / architect:** Harsha. Makes product, architecture, and design decisions. Does not perform routine coding or setup work.
- **Architecture partner:** ChatGPT. Helps evaluate trade-offs, records architectural decisions, reviews implementation, and maintains design intent.
- **Implementation agent:** Codex. Performs repository setup, coding, tests, CI/CD, deployment, and implementation changes.

## Operating principles

1. Treat `/docs` as the canonical source for product and architecture decisions.
2. Do not invent new architecture when an ADR or architecture document already covers the topic.
3. When implementation requires a new architectural decision, stop and surface the decision rather than silently choosing a materially different direction.
4. Prefer the simplest architecture that supports the current product hypothesis.
5. Start as a modular monolith. Do not introduce microservices, messaging infrastructure, graph databases, vector databases, or agent frameworks unless there is a demonstrated product or technical need.
6. Keep LLM providers behind an application abstraction. Domain logic and persisted learning state must not depend on one model vendor.
7. Learning concepts such as Division, Fractions, and Multiplication are data instances, not separate domain classes.
8. Preserve a clear separation between deterministic application/domain state and probabilistic AI interpretation.
9. All implementation work should include appropriate tests.
10. Keep commits focused and readable.

## Git and deployment workflow

1. `main` is the only deployable branch and the only branch from which production/cloud deployment may run.
2. No implementation agent or human should push commits directly to `main`.
3. Every change must start from the latest `main` on a dedicated branch.
4. All changes must return to `main` through a pull request.
5. CI must run on pull requests before merge.
6. Deployment workflows must trigger only from `main` after a successful merge (or by an explicit manual workflow dispatch that deploys the `main` revision only).
7. Branch protection/rulesets should enforce the above policy at GitHub level, not rely only on convention.
8. Codex must never bypass branch protection, force-push `main`, or merge around failing required checks.

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
- `docs/domain-model.md`
- `docs/decisions/ADR-001-tech-stack.md`
