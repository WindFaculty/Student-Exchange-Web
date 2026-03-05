CREATE TABLE user_social_identities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    provider VARCHAR(30) NOT NULL,
    provider_user_id VARCHAR(120) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_user_social_identity_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX uq_provider_provider_user_id
    ON user_social_identities(provider, provider_user_id);

CREATE UNIQUE INDEX uq_user_provider
    ON user_social_identities(user_id, provider);
