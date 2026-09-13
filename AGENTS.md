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
10. Keep commits focused and readable. Prefer pull requests for substantial changes.

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
