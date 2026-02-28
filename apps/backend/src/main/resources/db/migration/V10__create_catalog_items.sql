CREATE TABLE catalog_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_type VARCHAR(30) NOT NULL,
    source_ref_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(2000),
    price DECIMAL(19,2) NOT NULL,
    stock INT NOT NULL,
    image_url LONGTEXT,
    search_title_norm VARCHAR(240),
    search_desc_norm VARCHAR(2000),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    archived_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

