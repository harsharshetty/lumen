# Lumen — Architecture

## Current architectural direction

Lumen will begin as a modular monolith with a separate web frontend and backend API.

```text
React + TypeScript + Material UI
            |
          REST
            |
Java 21 + Spring Boot modular monolith
            |
        PostgreSQL
```

AI model providers sit behind an application abstraction. They assist with interpretation and reasoning but do not own persisted domain truth.

## Why a modular monolith

The product model is still evolving. A modular monolith keeps deployment, debugging, transactions, and development simple while still allowing strong internal boundaries. We will split services only when operational or ownership pressures make that worthwhile.

## Initial modules

Likely backend modules include:

- learner
- curriculum
- concept
- evidence
- learning-state
- planning
- recommendation
- ai

These are logical boundaries inside one deployable application, not microservices.

## Deterministic vs probabilistic responsibilities

### Application/domain owns

- persisted learner state
- concept identities and relationships
- evidence records and provenance
- parent-set time constraints
- plan versions and allocations
- recommendation history
- confidence metadata and audit trail
- invariants and validation rules

### AI may assist with

- interpreting uploaded schoolwork
- mapping evidence to concepts
- extracting likely learning signals
- explaining recommendations
- proposing diagnostic questions
- generating candidate next actions

AI output should be treated as proposed interpretation, not unquestioned domain truth.

## Persistence

PostgreSQL is the system of record for structured application state.

Do not add a graph database merely because curriculum concepts have relationships. Model those relationships relationally first. Do not add a vector database until retrieval requirements demonstrate a real need.

## API style

Use REST initially. Favor explicit resource-oriented endpoints and clear request/response contracts.

## File ingestion

Uploaded worksheets, tests, and other evidence will eventually require object storage. The exact storage provider is intentionally undecided for now. Store file metadata and evidence relationships in PostgreSQL.

## Deployment

Deployment should remain simple and GitHub-driven. Exact cloud providers are not locked yet; choose only after comparing cost, operational simplicity, Java/PostgreSQL support, and CI/CD ergonomics.

## Guardrails

Do not introduce without an explicit architectural decision:

- microservices
- Kafka or other event streaming
- Kubernetes
- graph databases
- vector databases
- workflow/orchestration frameworks
- agent frameworks
- vendor-specific AI types in the core domain
