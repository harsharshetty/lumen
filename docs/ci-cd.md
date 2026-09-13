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
- backend compile/test/integration-test
- frontend install/type-check/test/build
- publish CI status used as a required PR check

### Production deployment

`.github/workflows/deploy-prod.yml`

Trigger:
- successful completion of the CI workflow for a `main` commit

Responsibilities:
- deploy the backend and frontend to the production Render services
- associate the deployment job with GitHub environment `prod`
- use GitHub secrets/environment secrets for Render deploy hooks or credentials
- never deploy PR branches or arbitrary feature-branch commits

## Cloud target for V0

- Backend: Render web service
- Frontend: Render static site
- Database: Render managed PostgreSQL

No deployment credentials are stored in the repository.
