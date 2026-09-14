CREATE TABLE subjects (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE curricula (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    grade_level VARCHAR(100) NOT NULL,
    subject_id UUID NOT NULL REFERENCES subjects(id)
);

CREATE TABLE learning_concepts (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE curriculum_concepts (
    id UUID PRIMARY KEY,
    curriculum_id UUID NOT NULL REFERENCES curricula(id),
    learning_concept_id UUID NOT NULL REFERENCES learning_concepts(id),
    CONSTRAINT uq_curriculum_concept UNIQUE (curriculum_id, learning_concept_id)
);

CREATE TABLE learners (
    id UUID PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL
);

CREATE TABLE learner_curricula (
    id UUID PRIMARY KEY,
    learner_id UUID NOT NULL REFERENCES learners(id),
    curriculum_id UUID NOT NULL REFERENCES curricula(id),
    CONSTRAINT uq_learner_curriculum UNIQUE (learner_id, curriculum_id)
);
