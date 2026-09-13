# Lumen — Domain Model

## Core modeling principle

Learning concepts are generic domain entities. Specific concepts such as Division, Fractions, or Multiplication are records/data instances, not separate code-level domain types.

Avoid models such as:

```java
class Division {}
class Fractions {}
class Multiplication {}
```

Prefer a generic concept model:

```text
LearningConcept
- id
- name
- subject
- grade
- curriculum
- metadata
- relationships
```

Example concept data:

```json
{
  "id": "math.grade3.division",
  "name": "Division",
  "subject": "Mathematics",
  "grade": 3
}
```

## Initial domain concepts

### Learner
Represents the child whose learning is being managed.

### LearningConcept
Represents a curriculum concept or skill.

### ConceptRelationship
Represents prerequisite, parent/child, sequencing, or other relationships between concepts.

### Evidence
Represents an observation that may change what Lumen believes about the learner.

Possible sources include:
- school tests
- worksheets
- notebook work
- targeted diagnostics
- parent observations

Evidence should retain provenance and time context.

### LearnerConceptState
Represents the current structured view of the learner for a specific concept.

Candidate dimensions:
- understanding
- recall
- application
- retention
- confidence
- evidence sufficiency

The exact scoring/state representation is intentionally not finalized yet.

### LearningGoal
Represents parent-defined goals such as school exams, Olympiad preparation, catch-up, or maintenance.

### TimeBudget
Represents the study time explicitly provided by the parent for a planning period.

### LearningPlan
A versioned allocation of the available time across recommended actions.

A plan should preserve why each allocation was made and what evidence supported it.

### Recommendation
A proposed action tied to evidence, confidence, uncertainty, and—where necessary—a suggested verification step.

### Diagnostic
A deliberately small evidence-gathering activity used when the system does not know enough to allocate time confidently.

## Important invariant

A test score is evidence. It is not, by itself, a learning state.

Likewise, a single wrong answer must not automatically turn a concept into "weak".

## Longitudinal behavior

Lumen should preserve enough history to answer:

- What did we believe before?
- What evidence changed that belief?
- Why did the plan change?
- What did we stop spending time on?
- What was reallocated instead?

This auditability is part of the product value, not just a technical concern.
