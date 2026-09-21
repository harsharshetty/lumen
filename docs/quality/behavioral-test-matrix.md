# Lumen behavioral requirements traceability matrix

This document is the Quality-owned release contract for approved product behavior. It answers a different question from code coverage: **which approved behaviors and security/privacy invariants are actually protected by automated tests at the boundary where they can fail?**

## Status vocabulary

- **Protected** — implemented behavior has the required automated protection at the appropriate boundary.
- **Partial** — some implementation/tests exist, but at least one required behavioral boundary or negative path is still missing.
- **Unprotected** — behavior is implemented but lacks required automated behavioral protection. A release-blocking item in this state is a quality blocker.
- **Not yet implemented** — approved behavior is not on `main`; tests may be specified but are dependency-blocked.

Raw line/branch coverage is tracked independently. Lumen's 100% line/branch requirement remains mandatory, but it does not make a release-blocking behavior complete by itself.

## Release-quality rules

1. Every implemented release-blocking behavior must have automated behavioral protection at an appropriate boundary.
2. Security/privacy rules require negative-path tests as well as happy paths.
3. A forbidden operation test must assert both the response and, where mutation is possible, that persisted state did not change.
4. Browser E2E protects critical user journeys; exhaustive permission permutations belong primarily at the faster server/integration boundary.
5. PostgreSQL-specific constraints and migrations must be verified against PostgreSQL, not inferred from H2-only tests.
6. When approved behavior is introduced, changed, or removed, this matrix must be updated in the same logical delivery sequence.
7. Tests derive from approved architecture/product semantics; tests do not invent product behavior.

## Current traceability matrix

Status reflects `main` at `a2533305` (2026-09-21). Open PRs are not counted as protection on `main`.

| Source | Behavior / invariant | Risk | Required layer | Current automated protection on `main` | Status | Next protection / dependency |
| --- | --- | --- | --- | --- | --- | --- |
| #19 / ADR-002 | One `(provider, providerSubject)` identifies one Lumen User; email/name are not identity keys | Release-blocking | domain + persistence + server integration + E2E | `LoginIdentityDomainTest`, `IdentityAccessDomainTest`, repository coverage and `AuthenticatedUserServiceTest` protect the runtime resolution/provisioning rule | Partial | Browser identity journey #27 still required |
| #19 / ADR-002 | Different OAuth providers remain different Lumen Users even when profile/email matches | Release-blocking | server integration + E2E | Domain/runtime rule is covered, but no browser cross-provider journey exists on `main` | Partial | #27 |
| #19 | Unauthenticated caller cannot use protected application APIs | Release-blocking | server integration + E2E | `SecurityBoundaryTest`; Playwright learner-isolation suite proves unauthenticated learner API rejection | Protected | Keep negative-path coverage release-blocking |
| #19 | First login provisions one USER + LoginIdentity; repeat login resolves same User | Release-blocking | server integration + persistence + E2E | `AuthenticatedUserServiceTest` and repository coverage protect service/persistence behavior | Partial | #27 browser journey |
| #19/#21 | USER vs ADMIN authorization is enforced server-side | Release-blocking | server integration + E2E | `CurriculumCatalogControllerIntegrationTest` protects canonical catalog boundary; no admin browser lifecycle suite yet | Partial | #28 |
| #20/#23 | User can access only learners linked through `UserLearnerAccess`; no global learner enumeration or known-ID bypass | Release-blocking | server integration + E2E | `LearnerAuthorizationBoundaryTest`, `LearnerControllerIntegrationTest`, `e2e/tests/learner-isolation.spec.ts` cover list/direct-read/mutation isolation | Protected | Preserve as release blocker |
| #20 | VIEWER reads only; CONTRIBUTOR may change academic configuration; OWNER additionally owns access/destructive capability when implemented | Release-blocking | server integration + E2E | `LearnerAuthorizationBoundaryTest` plus Playwright access-matrix coverage protect implemented read/curriculum-mutation permissions | Partial | Access-management/destructive portion waits on #37/#38 |
| #20 | Multiple OWNERs allowed; duplicate User+Learner relationship prevented | High | domain + PostgreSQL integration + E2E | Domain/repository constraints plus Playwright multiple-owner scenario; PostgreSQL suite runs in CI | Protected | Preserve PostgreSQL verification |
| #21 | USER reads active canonical catalog but cannot mutate; ADMIN may manage canonical curricula | Release-blocking | server integration + E2E | `CurriculumCatalogControllerIntegrationTest` protects server authorization/lifecycle | Partial | #28 admin browser lifecycle |
| #21/#23 | Inactive curriculum cannot be newly selected while existing associations are retained | High | server integration + PostgreSQL + E2E | Controller/service coverage and onboarding E2E prove inactive catalog entries are not offered for new selection | Partial | Explicit retained-association lifecycle proof remains required with admin E2E #28 |
| #23 | Learner creation derives acting user from authenticated context and creator becomes OWNER | Release-blocking | server integration + E2E | `LearnerControllerIntegrationTest`; learner-isolation and onboarding Playwright journeys create through UI/API boundary | Protected | Preserve direct-impersonation negative paths in #32 |
| #23 | Learner list/read is scoped; knowing another learner ID never bypasses authorization | Release-blocking | server integration + E2E | `LearnerAuthorizationBoundaryTest`, `LearnerControllerIntegrationTest`, learner-isolation Playwright direct-read/list assertions | Protected | None beyond regression maintenance |
| #23 | Curriculum selection is explicit; duplicate selection prevented; inactive curricula cannot be newly selected | High | server integration + PostgreSQL + E2E | Controller/service tests plus `e2e/tests/onboarding-curriculum.spec.ts`; PostgreSQL persistence gate is mandatory CI | Protected | Preserve remove/reselect lifecycle coverage as behavior evolves |
| #23 / ADR-002 | Subject/program choices are independent; one curriculum selection does not auto-enroll another | Release-blocking | server integration + E2E | `e2e/tests/onboarding-curriculum.spec.ts` directly asserts independent Mathematics/Hindi choices and absence of unintended selection after new session | Protected | None beyond regression maintenance |
| #25/#29 | No-learner user enters onboarding; returning user sees only authorized learners | High | component + E2E | learner-isolation and onboarding Playwright suites cover first-use, reload/new-session and authorized-only visibility | Protected | None beyond regression maintenance |
| #26 | Playwright exercises React + Spring Boot + PostgreSQL runtime and blocks CI on failure | High | E2E/CI | `e2e` CI job with PostgreSQL and retained failure diagnostics; feature suites include learner isolation/onboarding | Protected | #35 should improve reporting visibility, not weaken gate |
| #27 | Full authentication/identity-isolation browser journey including first/repeat login and cross-provider separation | Release-blocking | E2E | Infrastructure exists; current E2E security fixture does not substitute for real provider identity lifecycle proof | Not yet implemented | #27 remains dependency-ready against landed #19 |
| #28 | ADMIN curriculum lifecycle works end-to-end; USER cannot gain mutation rights via UI/direct API | Release-blocking | E2E + server integration | Server authorization exists; admin browser lifecycle is absent | Partial | #22/#28 UI integration |
| #29 | OWNER/CONTRIBUTOR/VIEWER/no-access behavior and cross-user learner isolation | Release-blocking | E2E + server integration | `e2e/tests/learner-isolation.spec.ts` plus server boundary tests; #29 closed complete | Protected | Invitation/access-management expansion belongs to #34/#37/#38 |
| #30 | Explicit onboarding/curriculum selection persists across new session and never auto-enrolls unintended curricula | Release-blocking | E2E | `e2e/tests/onboarding-curriculum.spec.ts`; #30 closed complete | Protected | None beyond regression maintenance |
| #33 | Flyway migrations and critical persistence constraints work on PostgreSQL | Release-blocking | PostgreSQL integration/CI | `PostgresPersistenceIntegrationTest` runs in dedicated `postgres-persistence` CI job against PostgreSQL 16 | Protected | Keep independent from H2/unit coverage |
| #34/#37/#38 / ADR-002 | OWNER-only invitation/access lifecycle, verified-email binding, expiry, resend invalidation, single-use, last-owner invariant | Release-blocking | server integration + PostgreSQL + E2E | Test contract exists in #34; product capability is not implemented | Not yet implemented | #37/#38 then #34 execution |
| #35 | Behavioral test layers/counts and remaining protection gaps are review-visible in CI | High | CI/reporting | Jobs are separated (backend, PostgreSQL, frontend, production visual, E2E), but counts/matrix gap summary are not published as a consolidated signal | Partial | #35 |
| #55 | SAST/SCA/secret/container security gates block vulnerable production delivery | Release-blocking before real user data | CI/security | Security refresh is in draft PR #141; current `main` does not yet contain those mandatory gates | Unprotected | #141 must refresh onto current `main` and clear image vulnerability gate without suppression |

## Required update pattern for feature PRs

When a PR changes approved behavior represented here, the delivery sequence must do one of the following before the feature issue can close:

- change the relevant row to **Protected** and name the automated tests that prove it; or
- leave it **Partial/Unprotected** with an explicit release-blocking QA issue and dependency, if the behavior is not yet safe to call complete; or
- leave it **Not yet implemented** when the PR is only infrastructure/domain preparation and the actual behavior has not landed.

Do not mark a behavior Protected merely because every changed line executed under a unit test. Protection means the product invariant is asserted at the boundary where a regression could violate it.

## Relationship to CI and coverage

CI exposes backend tests/coverage, PostgreSQL/Flyway persistence, frontend tests/coverage, production-container visual acceptance, controller tests, and Playwright E2E as independent signals. #35 remains open because behavioral test counts and remaining Partial/Unprotected release-blocking rows are not yet surfaced as a consolidated PR/main signal.

Security is deliberately tracked separately from behavioral correctness. Until #55/#141 lands green on current `main`, a green correctness pipeline must not be interpreted as proof that the production artifact clears the mandatory HIGH/CRITICAL security boundary.
