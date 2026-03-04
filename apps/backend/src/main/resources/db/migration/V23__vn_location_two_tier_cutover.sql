UPDATE users u
LEFT JOIN ref_vn_wards w
    ON LOWER(u.ward_code) = LOWER(w.code)
    AND w.active = TRUE
LEFT JOIN ref_vn_provinces p
    ON LOWER(u.province_code) = LOWER(p.code)
    AND p.active = TRUE
SET u.address = NULLIF(TRIM(CONCAT_WS(
    ', ',
    NULLIF(TRIM(u.address_line), ''),
    NULLIF(TRIM(w.name_current), ''),
    NULLIF(TRIM(p.name_current), '')
)), '')
WHERE u.address_line IS NOT NULL
   OR u.ward_code IS NOT NULL
   OR u.province_code IS NOT NULL;

UPDATE users
SET district_code = NULL;

UPDATE users
SET province_code = NULL,
    ward_code = NULL;

DELETE FROM ref_vn_wards;
DELETE FROM ref_vn_districts;
DELETE FROM ref_vn_provinces;

ALTER TABLE ref_vn_wards
    DROP FOREIGN KEY fk_ref_vn_wards_district_code;

DROP INDEX idx_ref_vn_wards_district_code ON ref_vn_wards;
DROP INDEX idx_ref_vn_districts_province_code ON ref_vn_districts;
DROP INDEX idx_users_district_code ON users;

ALTER TABLE ref_vn_wards
    DROP COLUMN district_code;

DROP TABLE ref_vn_districts;

ALTER TABLE users
    DROP COLUMN district_code;

ALTER TABLE ref_vn_sync_state
    DROP COLUMN district_count;

UPDATE ref_vn_sync_state
SET
    last_status = 'IDLE',
    last_source = 'LOCAL_CURATED_POST_2025',
    last_synced_at = NULL,
    last_success_at = NULL,
    province_count = 0,
    ward_count = 0,
    last_error = NULL
WHERE id = 1;
