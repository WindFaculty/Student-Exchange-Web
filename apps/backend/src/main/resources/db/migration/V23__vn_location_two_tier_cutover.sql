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

SET @sql := IF(
    (SELECT COUNT(*)
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'users'
       AND column_name = 'district_code') > 0,
    'UPDATE users SET district_code = NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE users
SET province_code = NULL,
    ward_code = NULL;

SET @sql := IF(
    (SELECT COUNT(*)
     FROM information_schema.tables
     WHERE table_schema = DATABASE()
       AND table_name = 'ref_vn_wards') > 0,
    'DELETE FROM ref_vn_wards',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    (SELECT COUNT(*)
     FROM information_schema.tables
     WHERE table_schema = DATABASE()
       AND table_name = 'ref_vn_districts') > 0,
    'DELETE FROM ref_vn_districts',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    (SELECT COUNT(*)
     FROM information_schema.tables
     WHERE table_schema = DATABASE()
       AND table_name = 'ref_vn_provinces') > 0,
    'DELETE FROM ref_vn_provinces',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    (SELECT COUNT(*)
     FROM information_schema.table_constraints
     WHERE constraint_schema = DATABASE()
       AND table_name = 'ref_vn_wards'
       AND constraint_name = 'fk_ref_vn_wards_district_code'
       AND constraint_type = 'FOREIGN KEY') > 0,
    'ALTER TABLE ref_vn_wards DROP FOREIGN KEY fk_ref_vn_wards_district_code',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    (SELECT COUNT(*)
     FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name = 'ref_vn_wards'
       AND index_name = 'idx_ref_vn_wards_district_code') > 0,
    'DROP INDEX idx_ref_vn_wards_district_code ON ref_vn_wards',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    (SELECT COUNT(*)
     FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name = 'ref_vn_districts'
       AND index_name = 'idx_ref_vn_districts_province_code') > 0,
    'DROP INDEX idx_ref_vn_districts_province_code ON ref_vn_districts',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    (SELECT COUNT(*)
     FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name = 'users'
       AND index_name = 'idx_users_district_code') > 0,
    'DROP INDEX idx_users_district_code ON users',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    (SELECT COUNT(*)
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'ref_vn_wards'
       AND column_name = 'district_code') > 0,
    'ALTER TABLE ref_vn_wards DROP COLUMN district_code',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

DROP TABLE IF EXISTS ref_vn_districts;

SET @sql := IF(
    (SELECT COUNT(*)
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'users'
       AND column_name = 'district_code') > 0,
    'ALTER TABLE users DROP COLUMN district_code',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    (SELECT COUNT(*)
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'ref_vn_sync_state'
       AND column_name = 'district_count') > 0,
    'ALTER TABLE ref_vn_sync_state DROP COLUMN district_count',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

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
