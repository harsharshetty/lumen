# ADR-002 — Identity, learner access, and curriculum administration

## Status
Accepted

## Context

Lumen's initial product foundation needs to support authenticated adult users, shared access to the same learners by multiple adults, learner profile creation, and selection of curricula for each learner.

Curricula are reference data that will later drive assessment and planning. They therefore cannot be crowd-authored or directly edited by normal users without introducing ambiguity about which syllabus is canonical.

## Decision

### Authentication

Lumen will support external identity providers rather than managing passwords or MFA itself. The application model must remain provider-neutral so that providers such as Google, Apple, Microsoft, and GitHub can be supported.

A Lumen `User` represents one authenticated product identity. In V1, identity is resolved by the stable pair `(provider, providerSubject)`.

Each external OAuth/OIDC identity maps to exactly one Lumen `User`, and each Lumen `User` has exactly one provider identity in V1. Repeated authentication with the same provider and provider subject resolves to the same Lumen `User`.

Identities from different providers are treated as different Lumen users even when they present the same verified email address, display name, or other profile attributes. Lumen must not automatically link, merge, or reconcile cross-provider identities based on matching profile data.

Cross-provider account linking or merging is not part of V1 and is not assumed as a future direction. Any such capability would require an explicit new product and architecture decision.

### Users and account lifecycle

A user may deactivate their Lumen account only when that action would not leave any learner without at least one `OWNER`.

If the user is the sole `OWNER` of any learner, account deactivation must be rejected until another `OWNER` is added for each affected learner.

Deactivating a user does not delete shared learner data, curriculum selections, or historical learner state. The deactivated user loses product access, while learner data remains available to other authorized users.

### Learners and access

`User` and `Learner` are distinct domain concepts.

Multiple users may have access to the same learner, and one user may have access to multiple learners. Access must therefore be modeled as a many-to-many relationship through `UserLearnerAccess`.

Initial learner-level access levels are:

- `OWNER` — full learner administration, including access management.
- `CONTRIBUTOR` — may view and update learner academic configuration/content allowed by the product, but may not manage access or destructive lifecycle operations.
- `VIEWER` — read-only access.

Multiple users may hold `OWNER` access for the same learner.

A learner is never hard-deleted in V1. Learner lifecycle uses archive/restore semantics:

- an `OWNER` may archive a learner;
- archived learners are excluded from normal active-learner flows;
- learner data, `UserLearnerAccess`, curriculum selections, and future evidence/history remain persisted while archived;
- an `OWNER` may restore an archived learner;
- archive/restore operations must preserve the invariant that a learner always has at least one `OWNER` while it exists.

Platform roles are separate from learner-level access. Initial platform roles are:

- `USER`
- `ADMIN`

### Curriculum ownership

Curricula are canonical, system-managed reference data.

Normal users may select which curricula apply to a learner but may not create, edit, or directly mutate canonical curricula in the initial product version.

The `ADMIN` role owns the supported curriculum catalog and must have product capabilities in the initial release to:

- create a supported curriculum;
- edit curriculum metadata and structure;
- activate or deactivate a curriculum;
- manage the subject and grade/program associations needed to make a curriculum selectable;
- maintain the curriculum content that defines what Lumen assesses against;
- inspect which curriculum version/status is currently available to users.

Admin changes must be persisted as canonical product state and must not depend on contributions from individual parents or guardians.

### Curriculum versioning

Curriculum changes are versioned.

Once a curriculum version is active and available for learner enrollment, substantive changes to curriculum content, structure, subject/grade/program meaning, or concept mapping create a new version rather than mutating the meaning of the existing version.

A new version of the same curriculum is available only for new enrollments unless a separate migration decision is made later. Existing learner enrollments continue to reference the version they originally selected.

This preserves historical meaning for future evidence, assessment, and learning-state data.

Because curricula are curated by Lumen, version creation is expected to align primarily with academic-cycle changes rather than frequent mid-cycle edits. The product therefore does not require complex mid-cycle automatic migration behavior in V1.

Purely non-semantic metadata corrections that do not change curriculum meaning may be updated in place.

### Learner curriculum selection

A user with sufficient learner access chooses curricula explicitly for each learner. There is no automatic enrollment into all curricula for a board, grade, or subject.

A learner may therefore use different curriculum choices per subject, for example CBSE Hindi while opting out of an Olympiad Hindi curriculum, while simultaneously using both CBSE and Olympiad curricula for Mathematics.

### User-defined curricula

User-defined/custom curricula are explicitly deferred. The initial product supports only admin-managed canonical curricula.

## Consequences

- External identity resolution is keyed by `(provider, providerSubject)`.
- Different provider identities remain different Lumen users even when profile attributes such as email or name match.
- Cross-provider account linking/merging is not implemented or inferred in V1.
- Account deactivation is blocked when it would orphan a learner without an OWNER.
- Learners use archive/restore lifecycle semantics and are not hard-deleted in V1.
- Lumen requires an admin-facing curriculum-management experience in V1.
- Curriculum administration is a core product capability, not merely an operational database task.
- Curriculum versions preserve historical learner meaning; new curriculum versions apply to new enrollments by default.
- Learner onboarding depends on the active curriculum catalog maintained by admins.
- Authorization must enforce both platform role checks and learner-level access checks.
- Normal-user flows cannot mutate canonical curriculum data.
- Future custom/user-defined curricula can be introduced later as a separate capability without weakening the canonical catalog model.
