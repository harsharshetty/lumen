# ADR-002 — Identity, learner access, and curriculum administration

## Status
Accepted

## Context

Lumen's initial product foundation needs to support authenticated adult users, shared access to the same learners by multiple adults, learner profile creation, and selection of curricula for each learner.

Curricula are reference data that will later drive assessment and planning. They therefore cannot be crowd-authored or directly edited by normal users without introducing ambiguity about which syllabus is canonical.

## Decision

### Authentication

Lumen will support external identity providers rather than managing passwords or MFA itself. The application model must remain provider-neutral so that providers such as Google, Apple, Microsoft, and GitHub can be supported.

For V1, one external OAuth/OIDC identity is exactly one Lumen `User`. Identity is determined by the pair `(provider, providerSubject)`.

Lumen will not attempt to determine whether identities from two different providers belong to the same real-world person. Even when two provider identities expose the same email address or display name, they are separate Lumen users.

There is no cross-provider account linking, merging, or reconciliation in V1. Supporting those capabilities later requires a separate product and architecture decision.

A provider-neutral login identity representation may still be kept separate from the `User` entity for technical isolation, but the V1 cardinality is one login identity to one user and one user to one login identity.

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

### Learner invitations and sharing

Access to an existing learner is never inferred from OAuth identity, matching email/name attributes, or learner-profile similarity. Existing learner access is established through an explicit invitation flow.

Only a current `OWNER` may invite another adult to a learner or revoke an existing user's learner access. `CONTRIBUTOR` and `VIEWER` cannot invite or revoke users.

An `OWNER` may invite another adult with any learner access level:

- `OWNER`
- `CONTRIBUTOR`
- `VIEWER`

Invitations are sent to a specific email address. To accept an invitation, the invitee must authenticate through a supported OAuth/OIDC provider whose verified email matches the invited email address.

Authentication alone does not grant learner access. After authentication, the invitee must explicitly accept the invitation before `UserLearnerAccess` is created or changed.

A learner invitation is:

- valid for 7 days;
- single-use;
- explicitly declineable by the invitee;
- revocable by an `OWNER` at any time while pending.

Invitation terminal states include accepted, declined, expired, and revoked.

At most one valid pending invitation may exist for the same learner and invited email at a time. If an `OWNER` resends an invitation, the previous pending invitation is automatically invalidated and a new 7-day invitation is issued without requiring a separate revoke action.

If the invited OAuth identity already maps to an existing Lumen `User`, accepting the invitation attaches that existing user to the learner; no new user is created.

If that user already has `UserLearnerAccess` for the learner, accepting the invitation updates the existing access level to the level specified by the newly accepted invitation rather than creating a duplicate access record.

An `OWNER` may later change another user's learner access level among `OWNER`, `CONTRIBUTOR`, and `VIEWER`, or revoke that user's learner access.

A learner must always have at least one `OWNER`. Any revoke, demotion, or self-removal operation that would leave the learner with zero owners must be rejected.

For V1, duplicate learner profiles created independently by different users are not automatically matched or merged. The intended sharing path is for an existing owner to invite the other adult. Automatic learner matching/merging is deferred.

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
- Signing in through a different OAuth provider creates/resolves a different Lumen user, even if email or name matches an existing user.
- Cross-provider identity linking/merging is explicitly deferred.
- Existing learner access requires explicit owner-driven invitation and invitee acceptance.
- Invitation acceptance must verify the authenticated OAuth identity's verified email against the invited email.
- Learner access administration must preserve the invariant that every learner has at least one owner.
- Duplicate learners are not automatically reconciled in V1.
- Future custom/user-defined curricula can be introduced later as a separate capability without weakening the canonical catalog model.
