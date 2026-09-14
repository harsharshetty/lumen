# Lumen CI/CD

## Current environments

Lumen currently has one deployment environment:

- `prod`

Additional environments such as `dev` and `staging` may be added later without changing the branch policy.

## Branch policy

- `main` is the only deployable branch.
- Pull requests target `main` and must pass CI before merge.
- No pull request or feature branch deploys.
- After merge, the resulting `main` commit is rebuilt by CI.
- Production deployment starts only after that `main` CI run succeeds.

## GitHub Actions

### CI

`.github/workflows/ci.yml`

Triggers:
- pull requests targeting `main`
- pushes to `main`

Responsibilities:
- backend compile/test/integration-test and JaCoCo coverage enforcement
- frontend install, dependency audit, type-check, tests/coverage, and build
- CodeQL static analysis for Java/Kotlin and JavaScript/TypeScript
- Trivy filesystem scanning for dependency vulnerabilities, committed secrets, and configuration issues
- production backend image build and Trivy image vulnerability scan
- Playwright browser E2E after correctness and security gates succeed
- publish CI status used as the merge/deployment gate

### Security policy

Security checks are additive to the existing correctness and coverage gates.

- CodeQL findings are uploaded to GitHub code scanning and the CodeQL job must complete successfully.
- Trivy source and container scans fail CI for known `HIGH` or `CRITICAL` findings that have fixes available.
- npm dependency audits fail CI at `HIGH` or `CRITICAL` severity.
- Trivy secret and misconfiguration detection runs in the normal PR/main delivery path.
- Third-party GitHub Actions are referenced by immutable commit SHA, with the corresponding release line documented in comments.
- Dependabot checks Maven, frontend npm, E2E npm, GitHub Actions, and Docker dependencies weekly.

A security gate must not be bypassed merely to make a PR green. A false positive or risk acceptance requires an explicit documented exception with rationale, scope, owner, and follow-up; critical authorization/privacy issues remain release blocking.

### Production deployment

`.github/workflows/deploy-prod.yml`

Trigger:
- successful completion of the CI workflow for a `main` commit

Responsibilities:
- deploy the backend and frontend to the production Render services
- associate the deployment job with GitHub environment `prod`
- use GitHub secrets/environment secrets for Render deploy hooks or credentials
- never deploy PR branches or arbitrary feature-branch commits

Because production deployment is triggered only by a successful `CI` workflow, the security jobs above are part of the production gate rather than advisory-only checks.

Exact tested-revision-to-deployed-revision binding remains tracked separately in #56.

## Cloud target for V0

- Backend: Render web service
- Frontend: Render static site
- Database: Render managed PostgreSQL

No deployment credentials are stored in the repository.
