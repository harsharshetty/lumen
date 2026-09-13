# Issue #1 — Bootstrap Lumen V0

Implement GitHub Issue #1 on this branch only.

Read `AGENTS.md` and all canonical documents under `/docs` before implementation.

Scope:
- Java 21 + Spring Boot backend
- PostgreSQL + Flyway
- React + TypeScript + Material UI shell
- Docker Compose local PostgreSQL
- GitHub Actions CI
- Render deployment configuration
- Actuator health endpoint
- Tests

Domain scope is limited to:
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
- Keep implementation simple; avoid speculative abstractions and unnecessary interface/impl boilerplate.
- No authentication, LLM SDK, Evidence, LearnerConceptState, goals, time budgets, plans, diagnostics, recommendations, microservices, Kafka, Kubernetes, graph/vector databases, workflow engines, or agent frameworks.

Workflow:
- Work only on this feature branch.
- Keep the PR in draft until implementation and tests are complete.
- Do not push to `main`.
- Deployment must be main-only after merge.
