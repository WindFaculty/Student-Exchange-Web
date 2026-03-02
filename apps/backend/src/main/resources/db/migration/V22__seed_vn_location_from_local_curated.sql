INSERT INTO ref_vn_provinces (
    code,
    name_current,
    name_old,
    is_merged,
    effective_date,
    source_tag,
    active
) VALUES (
    '79',
    'Hồ Chí Minh',
    'Bình Dương (một phần)',
    TRUE,
    '2025-07-01',
    'LOCAL_CURATED',
    TRUE
);

INSERT INTO ref_vn_districts (
    code,
    province_code,
    name_current,
    name_old,
    is_merged,
    effective_date,
    source_tag,
    active
) VALUES
(
    '79001',
    '79',
    'Thành phố Dĩ An',
    'Thị xã Dĩ An',
    TRUE,
    '2025-07-01',
    'LOCAL_CURATED',
    TRUE
),
(
    '79002',
    '79',
    'Huyện Hòa Bắc',
    NULL,
    FALSE,
    '2025-07-01',
    'LOCAL_CURATED',
    TRUE
);

INSERT INTO ref_vn_wards (
    code,
    district_code,
    province_code,
    name_current,
    name_old,
    is_merged,
    effective_date,
    source_tag,
    active
) VALUES
(
    '79001001',
    '79001',
    '79',
    'Phường Tân Đông Hiệp',
    'Xã Tân Đông Hiệp',
    TRUE,
    '2025-07-01',
    'LOCAL_CURATED',
    TRUE
),
(
    '79002001',
    '79002',
    '79',
    'Xã Hòa Bắc',
    NULL,
    FALSE,
    '2025-07-01',
    'LOCAL_CURATED',
    TRUE
);

UPDATE ref_vn_sync_state
SET
    last_status = 'SUCCESS',
    last_source = 'LOCAL_CURATED',
    last_synced_at = CURRENT_TIMESTAMP(6),
    last_success_at = CURRENT_TIMESTAMP(6),
    province_count = (SELECT COUNT(*) FROM ref_vn_provinces WHERE active = TRUE),
    district_count = (SELECT COUNT(*) FROM ref_vn_districts WHERE active = TRUE),
    ward_count = (SELECT COUNT(*) FROM ref_vn_wards WHERE active = TRUE),
    last_error = NULL
WHERE id = 1;
