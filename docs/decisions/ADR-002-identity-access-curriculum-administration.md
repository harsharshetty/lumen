# ADR-002 — Identity, learner access, and curriculum administration

## Status
Accepted

## Context

Lumen's initial product foundation needs to support authenticated adult users, shared access to the same learners by multiple adults, learner profile creation, and selection of curricula for each learner.

Curricula are reference data that will later drive assessment and planning. They therefore cannot be crowd-authored or directly edited by normal users without introducing ambiguity about which syllabus is canonical.

## Decision

### Authentication

Lumen will support external identity providers rather than managing passwords or MFA itself. The application model must remain provider-neutral so that providers such as Google, Apple, Microsoft, and GitHub can be supported.

A Lumen `User` represents the authenticated human. A separate login-identity binding may be used internally to associate one user with one or more external authentication providers without treating those provider accounts as different Lumen users.

### Learners and access

`User` and `Learner` are distinct domain concepts.

Multiple users may have access to the same learner, and one user may have access to multiple learners. Access must therefore be modeled as a many-to-many relationship through `UserLearnerAccess`.

Initial learner-level access levels are:

- `OWNER` — full learner administration, including access management.
- `CONTRIBUTOR` — may view and update learner academic configuration/content allowed by the product, but may not manage access or destructive lifecycle operations.
- `VIEWER` — read-only access.

Multiple users may hold `OWNER` access for the same learner.

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

### Learner curriculum selection

A user with sufficient learner access chooses curricula explicitly for each learner. There is no automatic enrollment into all curricula for a board, grade, or subject.

A learner may therefore use different curriculum choices per subject, for example CBSE Hindi while opting out of an Olympiad Hindi curriculum, while simultaneously using both CBSE and Olympiad curricula for Mathematics.

### User-defined curricula

User-defined/custom curricula are explicitly deferred. The initial product supports only admin-managed canonical curricula.

## Consequences

- Lumen requires an admin-facing curriculum-management experience in V1.
- Curriculum administration is a core product capability, not merely an operational database task.
- Learner onboarding depends on the active curriculum catalog maintained by admins.
- Authorization must enforce both platform role checks and learner-level access checks.
- Normal-user flows cannot mutate canonical curriculum data.
- Future custom/user-defined curricula can be introduced later as a separate capability without weakening the canonical catalog model.
