# Issue #1 — Bootstrap Lumen V0

Implement GitHub Issue #1 on this branch only.

Read `AGENTS.md` and all canonical documents under `/docs` before implementation.

## Scope

- Java 21 + Spring Boot backend
- PostgreSQL + Flyway
- React + TypeScript + Material UI shell
- Docker Compose local PostgreSQL
- GitHub Actions CI/CD
- Render production deployment configuration
- Actuator health endpoint
- Tests

## Domain scope

Limited to:
- Subject
- Curriculum
- LearningConcept
- CurriculumConcept
- Learner
- LearnerCurriculum

Canonical relationships:

```text
Subject 1 ----< Curriculum

Curriculum 1 ----< CurriculumConcept >---- 1 LearningConcept

Learner 1 ----< LearnerCurriculum >---- 1 Curriculum
```

Important decisions:
- `gradeLevel` belongs to `Curriculum`.
- `LearningConcept` has no direct relationship to `Subject`.
- Division, Fractions, Multiplication, etc. are data records, not Java classes.
- Use explicit association entities, not JPA `@ManyToMany`.
- Enforce uniqueness on `(curriculum_id, learning_concept_id)` and `(learner_id, curriculum_id)`.
- Flyway owns schema creation; Hibernate uses `ddl-auto=validate`.
- No authentication, LLM SDK, Evidence, LearnerConceptState, goals, time budgets, plans, diagnostics, recommendations, microservices, Kafka, Kubernetes, graph/vector databases, workflow engines, or agent frameworks.

## Mandatory backend package structure

Under the root application package, use:

```text
com.lumen
├── domain
├── repository
├── service
│   └── impl
├── controller
├── config
├── mappers
└── dto
```

Rules:
- All domain/JPA entities live in `domain`.
- All Spring Data JPA repositories live in `repository`.
- Every service is defined by an interface directly under `service`.
- Every concrete service implementation lives under `service.impl` and implements its corresponding service interface.
- Controllers depend only on service interfaces.
- All REST controllers live in `controller`.
- Configuration classes live in `config`.
- DTO/domain mapping code lives in `mappers`.
- Request/response DTOs live in lowercase Java package `dto`.
- Controllers expose DTOs only; domain/JPA entities never cross the HTTP boundary.
- Request DTOs are mapped to domain objects before persistence.
- Persisted domain objects are mapped to response DTOs before returning from controllers.
- Controllers never access repositories directly.

## CI/CD requirements

We currently have one environment only: `prod`.

### Pull request build

Whenever a pull request targets `main`, GitHub Actions must run a branch/PR build that:
- checks out the PR branch
- builds and tests the backend
- runs backend integration tests as appropriate
- installs frontend dependencies
- type-checks/tests/builds the frontend
- fails the PR check on any failed build or test
- does NOT deploy

### Main build

Whenever changes are merged/pushed to `main`, GitHub Actions must run the same full CI build against the resulting `main` commit.

### Production deployment

Deployment must happen only after the `main` CI workflow for that exact commit succeeds.

Requirements:
- only `main` may deploy
- feature branches and pull requests must never deploy
- use a GitHub Actions deployment workflow/job associated with GitHub environment `prod`
- deployment must not begin until CI on `main` has completed successfully
- configure the first production deployment for Render
- backend deploys to a Render web service
- frontend deploys as a Render static site
- PostgreSQL uses managed Render PostgreSQL
- use GitHub Actions secrets/environment secrets for deployment credentials or Render deploy hooks; do not commit credentials
- keep the workflow easy to extend later with additional environments such as `dev` or `staging`

Preferred workflow split:

```text
.github/workflows/ci.yml
.github/workflows/deploy-prod.yml
```

`ci.yml` should run on:
- `pull_request` targeting `main`
- `push` to `main`

`deploy-prod.yml` should run only after a successful CI run for `main` and deploy that same revision to the `prod` environment.

If Render-specific deployment requires one-time secrets or account authorization that cannot be created from repository code, implement everything possible in code and document the exact missing secret names/one-time authorization step without weakening the workflow.

## Git workflow

- Work only on `feature/bootstrap-v0` for this implementation.
- Keep PR #4 in draft until implementation and tests are complete.
- Do not push to `main`.
- All implementation must merge through PR #4 (or a replacement PR if necessary).
- Deployment is main-only after merge and successful main CI.
