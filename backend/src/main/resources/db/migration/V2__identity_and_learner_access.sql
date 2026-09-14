CREATE TABLE users (
    id UUID PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    platform_role VARCHAR(50) NOT NULL
);

CREATE TABLE user_learner_access (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    learner_id UUID NOT NULL REFERENCES learners(id),
    access_level VARCHAR(50) NOT NULL,
    CONSTRAINT uq_user_learner_access UNIQUE (user_id, learner_id)
);
