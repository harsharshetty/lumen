CREATE TABLE login_identities (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    provider VARCHAR(50) NOT NULL,
    provider_subject VARCHAR(255) NOT NULL,
    verified_email VARCHAR(320),
    CONSTRAINT uq_login_identity_provider_subject UNIQUE (provider, provider_subject),
    CONSTRAINT uq_login_identity_user UNIQUE (user_id)
);
