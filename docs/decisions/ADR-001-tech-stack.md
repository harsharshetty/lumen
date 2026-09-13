# ADR-001 — Initial Technology Stack

- Status: Accepted
- Date: 2026-09-13

## Context

Lumen is beginning as a new product with an evolving domain model. The priority is to move quickly while keeping architecture understandable, testable, and easy for AI implementation agents to work with.

## Decision

Use the following initial stack:

- Backend: Java 21 + Spring Boot
- Frontend: React + TypeScript
- UI library: Material UI
- Database: PostgreSQL
- API style: REST
- Architecture: modular monolith
- Source control: GitHub
- Implementation agent: Codex

## Rationale

### Java + Spring Boot
Provides a mature ecosystem, strong typing, explicit domain boundaries, excellent testing support, and a familiar operational model for substantial backend logic.

### React + TypeScript + Material UI
Provides a mature frontend stack with strong typing and a component system suitable for rapidly evolving a polished parent-facing product.

### PostgreSQL
The domain is structured and relational, with a need for history, provenance, relationships, and transactional consistency. PostgreSQL is the appropriate default before adding specialized persistence technologies.

### Modular monolith
Current uncertainty is primarily product/domain uncertainty rather than scale uncertainty. A modular monolith avoids premature distributed-system complexity while preserving internal boundaries.

## Consequences

- Backend and frontend can evolve independently but live in the same repository initially.
- No microservices unless a later ADR justifies the change.
- No graph or vector database by default.
- LLM integration must remain behind an abstraction rather than leaking provider-specific APIs into core domain code.
- Deployment provider remains an open decision and will be captured in a later ADR.
