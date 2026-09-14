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

CREATE INDEX idx_curricula_subject ON curricula(subject_id);
CREATE INDEX idx_curriculum_concepts_curriculum ON curriculum_concepts(curriculum_id);
CREATE INDEX idx_curriculum_concepts_concept ON curriculum_concepts(learning_concept_id);
CREATE INDEX idx_learner_curricula_learner ON learner_curricula(learner_id);
CREATE INDEX idx_learner_curricula_curriculum ON learner_curricula(curriculum_id);
