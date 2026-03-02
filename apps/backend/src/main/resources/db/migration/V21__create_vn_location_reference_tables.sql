CREATE TABLE ref_vn_provinces (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    name_current VARCHAR(255) NOT NULL,
    name_old VARCHAR(255) NULL,
    is_merged BOOLEAN NOT NULL DEFAULT FALSE,
    effective_date DATE NULL,
    source_tag VARCHAR(60) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;

CREATE TABLE ref_vn_districts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    province_code VARCHAR(40) NOT NULL,
    name_current VARCHAR(255) NOT NULL,
    name_old VARCHAR(255) NULL,
    is_merged BOOLEAN NOT NULL DEFAULT FALSE,
    effective_date DATE NULL,
    source_tag VARCHAR(60) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_ref_vn_districts_province_code
        FOREIGN KEY (province_code) REFERENCES ref_vn_provinces(code)
        ON UPDATE CASCADE ON DELETE RESTRICT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;

CREATE TABLE ref_vn_wards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    district_code VARCHAR(40) NOT NULL,
    province_code VARCHAR(40) NOT NULL,
    name_current VARCHAR(255) NOT NULL,
    name_old VARCHAR(255) NULL,
    is_merged BOOLEAN NOT NULL DEFAULT FALSE,
    effective_date DATE NULL,
    source_tag VARCHAR(60) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_ref_vn_wards_district_code
        FOREIGN KEY (district_code) REFERENCES ref_vn_districts(code)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_ref_vn_wards_province_code
        FOREIGN KEY (province_code) REFERENCES ref_vn_provinces(code)
        ON UPDATE CASCADE ON DELETE RESTRICT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;

CREATE TABLE ref_vn_sync_state (
    id BIGINT PRIMARY KEY,
    last_status VARCHAR(30) NOT NULL,
    last_source VARCHAR(80) NULL,
    last_synced_at DATETIME(6) NULL,
    last_success_at DATETIME(6) NULL,
    province_count INT NOT NULL DEFAULT 0,
    district_count INT NOT NULL DEFAULT 0,
    ward_count INT NOT NULL DEFAULT 0,
    last_error VARCHAR(2000) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;

ALTER TABLE users
    ADD COLUMN address_line VARCHAR(500) NULL AFTER address;

ALTER TABLE users
    ADD COLUMN province_code VARCHAR(40) NULL AFTER address_line;

ALTER TABLE users
    ADD COLUMN district_code VARCHAR(40) NULL AFTER province_code;

ALTER TABLE users
    ADD COLUMN ward_code VARCHAR(40) NULL AFTER district_code;

CREATE INDEX idx_ref_vn_districts_province_code ON ref_vn_districts(province_code);
CREATE INDEX idx_ref_vn_wards_district_code ON ref_vn_wards(district_code);
CREATE INDEX idx_ref_vn_wards_province_code ON ref_vn_wards(province_code);

CREATE INDEX idx_users_province_code ON users(province_code);
CREATE INDEX idx_users_district_code ON users(district_code);
CREATE INDEX idx_users_ward_code ON users(ward_code);

INSERT INTO ref_vn_sync_state (
    id,
    last_status,
    province_count,
    district_count,
    ward_count
) VALUES (
    1,
    'IDLE',
    0,
    0,
    0
);
