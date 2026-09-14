# Lumen behavioral requirements traceability matrix

This document is the Quality-owned release contract for approved product behavior. It answers a different question from code coverage: **which approved behaviors and security/privacy invariants are actually protected by automated tests at the boundary where they can fail?**

## Status vocabulary

- **Protected** — implemented behavior has the required automated protection at the appropriate boundary.
- **Partial** — some implementation/tests exist, but at least one required behavioral boundary or negative path is still missing.
- **Unprotected** — behavior is implemented but lacks the required automated behavioral protection. A release-blocking item in this state is a quality blocker.
- **Not yet implemented** — approved behavior is not on `main`; tests may be specified but are dependency-blocked.

Raw line/branch coverage is tracked independently. Lumen's 100% line/branch requirement remains mandatory, but it does not make a release-blocking behavior complete by itself.

## Release-quality rules

1. Every implemented release-blocking behavior must have automated behavioral protection at an appropriate boundary.
2. Security/privacy rules require negative-path tests as well as happy paths.
3. A forbidden operation test must assert both the response and, where mutation is possible, that persisted state did not change.
4. Browser E2E protects critical user journeys; exhaustive permission permutations belong primarily at the faster server/integration boundary.
5. PostgreSQL-specific constraints and migrations must ultimately be verified against PostgreSQL, not inferred from H2-only tests.
6. When an approved behavior is introduced, changed, or removed, this matrix must be updated in the same logical delivery sequence.
7. Tests derive from approved architecture/product semantics; tests do not invent product behavior.

## Current traceability matrix

The status below reflects `main` after authentication-boundary PR #67 and admin catalog shell PR #62. Work that exists only in an open PR is not counted as protected on `main`.

| Source | Behavior / invariant | Product area | Risk | Required layer | Current automated protection | Status | Blocking dependency / next protection |
| --- | --- | --- | --- | --- | --- | --- | --- |
| #19 / ADR-002 | One `(provider, providerSubject)` identifies one Lumen User; email/name are not identity keys | Identity | Release-blocking | domain + persistence + server integration + E2E | `LoginIdentityDomainTest`, identity/repository tests and `AuthenticatedUserServiceTest` protect the model and runtime resolution path; OAuth success handling is covered | Partial | Add persisted application-boundary identity proof; #33 PostgreSQL verification; browser journey #27 |
| #19 / ADR-002 | Different OAuth providers remain different Lumen Users even when email/name matches | Identity isolation | Release-blocking | server integration + E2E | Provider-neutral runtime mapping exists on `main`, but no explicit persisted cross-provider same-profile boundary test yet | Partial | Narrow #19 closure proof, then #27 E2E |
| #19 | Unauthenticated caller cannot use protected application APIs | Authentication | Release-blocking | server integration + E2E | `SecurityBoundaryTest` proves unauthenticated `/api/**` rejection; `LearnerApiExposureIntegrationTest` protects auth + CSRF behavior while learner routes remain absent | Partial | Server boundary is protected; add browser journey in #27 |
| #19 | First login provisions exactly one USER + LoginIdentity; repeat login resolves the same User | Identity lifecycle | Release-blocking | server integration + persistence + E2E | `AuthenticatedUserServiceTest` covers new-user provisioning and same-identity reuse; OAuth success handler coverage exercises provider/subject mapping | Partial | Add real persisted/server-boundary proof; #33 persistence; #27 E2E |
| #19 | USER vs ADMIN authorization is enforced server-side | Platform authorization | Release-blocking | server integration + E2E where user-visible | Role model exists, but role-to-request authorization enforcement/proof is not yet present | Not yet implemented | Narrow #19 closure slice; then #21/#32 and #28 |
| #20 / ADR-002 | User can access only learners linked through `UserLearnerAccess`; no global learner enumeration | Learner privacy | Release-blocking | server integration + E2E | `UserLearnerAccess` domain/schema exists; learner routes require authentication and remain unavailable until secured reintroduction | Partial | #20 enforcement; exhaustive #32; E2E #29 |
| #20 | VIEWER reads only; CONTRIBUTOR may change academic configuration; OWNER additionally manages access/destructive lifecycle | Learner authorization | Release-blocking | domain + server integration + E2E | Access-level enum/model tests exist; real request-boundary enforcement does not | Partial | #20, #32, #29 |
| #20 | Multiple OWNERs allowed; duplicate User+Learner relationship prevented | Learner access persistence | High | domain + PostgreSQL integration | Domain/schema coverage exists | Partial | #33 PostgreSQL constraint verification |
| #21 | USER may read active canonical catalog but cannot mutate canonical curricula; ADMIN may manage it | Curriculum administration | Release-blocking | server integration + E2E | Canonical curriculum domain/services pre-exist and auth runtime exists, but approved ADMIN API boundary is not implemented | Not yet implemented | #19 ADMIN enforcement + #21, #32, #28 |
| #21 | Deactivated curriculum cannot be newly selected, while existing learner associations are not silently deleted | Curriculum lifecycle | High | service/server integration + PostgreSQL + E2E | Approved behavior specified; final admin/onboarding API flow not implemented | Not yet implemented | #21/#23, #33, #28/#30 |
| #22 | Only ADMIN receives/uses curriculum-management UI; backend remains authoritative | Admin UI | Release-blocking | component + E2E + server integration | PR #62 added a tested dependency-safe admin catalog UX shell including active/inactive states and deactivation confirmation; no production ADMIN route/API integration yet | Partial | #21 real ADMIN APIs + #19 role enforcement; integrate shell; #28 |
| #23 | Authenticated learner creation makes creator OWNER; acting user comes only from authenticated context | Learner onboarding API | Release-blocking | server integration + E2E | Secured learner API intentionally absent | Not yet implemented | #20 + #21; #32/#29/#30 |
| #23 | Learner list/read is scoped to authorized learners; knowing another learner ID never bypasses access | Learner isolation | Release-blocking | server integration + E2E | Secured learner API intentionally absent | Not yet implemented | #20/#23; #32/#29 |
| #23 | Curriculum selection is explicit; duplicate selection prevented; inactive curricula cannot be newly selected | Curriculum selection | High | service/server integration + PostgreSQL + E2E | Existing generic association service tests do not constitute approved authenticated onboarding proof | Not yet implemented | #21/#23; #33/#30 |
| #23 / ADR-002 | Subject/program choices are independent; selecting one Olympiad subject must not auto-enroll another | Explicit enrollment | Release-blocking | server integration + E2E | No final onboarding behavior on `main` | Not yet implemented | #23; #30 |
| #25 | No-learner authenticated user enters onboarding; returning user sees only authorized learners and persisted selections | Learner onboarding UI | High | component + E2E | UI not implemented | Not yet implemented | #23 then #25; #29/#30 |
| #26 | Browser test infrastructure exercises real React + Spring Boot + datastore runtime and fails CI on E2E failure | E2E infrastructure | High | E2E/CI | `e2e/tests/smoke.spec.ts`; Playwright CI job with PostgreSQL and retained diagnostics; post-#67 main E2E is green | Protected | Foundation available for #27-#30/#34 |
| #27 | Auth and identity-isolation critical journey: unauth blocked, first/repeat login, cross-provider separation, no client impersonation | Authentication E2E | Release-blocking | E2E | Playwright infrastructure and runtime auth now exist; feature scenarios are not yet implemented | Not yet implemented | Can start now for implemented #19 behavior; complete after narrow #19 closure |
| #28 | ADMIN curriculum lifecycle works end-to-end; USER cannot gain mutation rights via UI or direct API | Curriculum E2E | Release-blocking | E2E + server integration | UX shell exists, but ADMIN API/authorization path does not | Not yet implemented | #19 ADMIN enforcement + #21 + #22; #26 complete |
| #29 | OWNER/CONTRIBUTOR/VIEWER/no-access behavior and cross-user learner isolation are protected end-to-end | Learner authorization E2E | Release-blocking | E2E + server integration | Infrastructure only | Not yet implemented | #20 + #23 + #25; #26 complete |
| #30 | Explicit onboarding/curriculum selection persists across reload/session and never auto-enrolls unintended curricula | Onboarding E2E | Release-blocking | E2E | Infrastructure only | Not yet implemented | #21 + #23 + #25; #26 complete |
| #37/#38/#34 / ADR-002 | Only OWNER manages invitations/access; matching verified invited email; explicit accept; 7-day expiry; one active invite; resend invalidates prior; single-use; last OWNER retained | Shared learner access | Release-blocking | server integration + PostgreSQL + E2E | Test contract defined in #34; product behavior not implemented | Not yet implemented | #20 then #37/#38; #34 executes alongside/after implementation |

## Required update pattern for feature PRs

When a PR changes an approved behavior represented here, the delivery sequence must do one of the following before the feature issue can close:

- change the relevant row to **Protected** and name the automated tests that prove it; or
- leave it **Partial/Unprotected** with an explicit release-blocking QA issue and dependency, if the behavior is not yet safe to call complete; or
- leave it **Not yet implemented** when the PR is only infrastructure/domain preparation and the actual behavior has not landed.

Do not mark a behavior Protected merely because every changed line executed under a unit test. Protection means the product invariant is asserted at the boundary where a regression could violate it.

## Relationship to CI and coverage

CI currently exposes backend tests/coverage, frontend tests/coverage, container build, and Playwright E2E as independent jobs/signals. The post-PR #67 `main` run is green across all four layers. Future #35 work will make behavioral test counts and remaining Partial/Unprotected release-blocking rows more visible in CI reporting. Until then, this document is the auditable behavioral-protection ledger.
