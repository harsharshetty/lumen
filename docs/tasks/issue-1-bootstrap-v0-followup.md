# Issue #1 follow-up — implement approved backend conventions and CI/CD

Codex: implement the current approved V0 architecture on `feature/bootstrap-v0` and update PR #4.

Read first:
- `AGENTS.md`
- `docs/domain-model.md`
- `docs/architecture-conventions.md`
- `docs/ci-cd.md`
- `docs/tasks/issue-1-bootstrap-v0.md`

Mandatory corrections to any earlier generated implementation:

1. Move all JPA/domain classes into `com.lumen.domain`.
2. Move all Spring Data JPA repositories into `com.lumen.repository`.
3. Define all service APIs as interfaces directly under `com.lumen.service`.
4. Put every concrete service implementation under `com.lumen.service.impl` and make it implement its corresponding interface.
5. Controllers live in `com.lumen.controller` and depend only on service interfaces.
6. Configuration classes live in `com.lumen.config`.
7. DTO/domain mapping code lives in `com.lumen.mappers`.
8. Request/response DTOs live in `com.lumen.dto`.
9. Controllers expose DTOs only. Never serialize JPA entities from REST endpoints.
10. Map request DTOs to domain objects before persistence and map persisted domain objects back to response DTOs before returning.

CI/CD requirements are already documented and workflow stubs exist on the branch:
- PR to `main` => full CI build/test, no deployment.
- Push/merge to `main` => full CI build/test.
- successful CI for `main` => deploy to GitHub environment `prod` only.
- prod target: Render backend web service + Render static frontend + Render managed PostgreSQL.
- no feature branch or PR deployment.

Complete/refine `.github/workflows/ci.yml` and `.github/workflows/deploy-prod.yml` as needed so they work with the actual project structure and package manager files you create.

Also create any required backend/frontend project files, tests, Flyway migration, compose file, Dockerfiles and Render configuration necessary to satisfy Issue #1.

Do not push to `main`. Commit and push all implementation to `feature/bootstrap-v0` and update PR #4. Keep the PR in draft until tests/checks are green. If external account authorization or secrets are required for the first Render deployment, stop only for that one-time external authorization and report the exact secret names or action required.