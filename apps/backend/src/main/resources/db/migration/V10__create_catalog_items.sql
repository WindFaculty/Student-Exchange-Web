CREATE TABLE catalog_items (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    source_type NVARCHAR(30) NOT NULL,
    source_ref_id BIGINT NOT NULL,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(2000),
    price DECIMAL(19,2) NOT NULL,
    stock INT NOT NULL,
    image_url NVARCHAR(MAX),
    search_title_norm NVARCHAR(240),
    search_desc_norm NVARCHAR(2000),
    active BIT NOT NULL DEFAULT 1,
    archived_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);
