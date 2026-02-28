-- Normalize listing category labels to canonical Vietnamese values.
UPDATE listings
SET category = 'Đồ dùng học tập'
WHERE category IN ('Do dung hoc tap', 'STUDY_SUPPLIES');

UPDATE listings
SET category = 'Đồ điện tử và công nghệ'
WHERE category IN ('Do dien tu & cong nghe', 'Do dien tu va cong nghe', 'ELECTRONICS_TECH');

UPDATE listings
SET category = 'Quần áo, giày dép, phụ kiện thời trang'
WHERE category IN ('Quan ao, giay dep, phu kien thoi trang', 'FASHION_ACCESSORIES');

UPDATE listings
SET category = 'Đồ dùng cá nhân và sinh hoạt'
WHERE category IN ('Do dung ca nhan & sinh hoat', 'Do dung ca nhan va sinh hoat', 'PERSONAL_LIVING');

UPDATE listings
SET category = 'Thuê - cho thuê'
WHERE category IN ('Thue - cho thue', 'RENTAL');

UPDATE listings
SET category = 'Dịch vụ'
WHERE category IN ('Dich vu', 'SERVICES');

UPDATE listings
SET category = 'Khác'
WHERE category IN ('Khac', 'OTHER');

UPDATE listings
SET category = 'Sách'
WHERE category IN ('SACH', 'BOOKS');

UPDATE listings
SET category = 'Văn phòng phẩm'
WHERE category IN ('VAN PHONG PHAM', 'STATIONERY');

UPDATE listings
SET category = 'Đồ gia dụng'
WHERE category IN ('DO GIA DUNG', 'HOUSEHOLD');

UPDATE listings
SET category = 'Linh kiện IoT'
WHERE category IN (
    'Linh kien IoT',
    'IOT_COMPONENT',
    'Board vi dieu khien / Module phat trien',
    'Cam bien',
    'Thiet bi thuc thi / Output',
    'Module giao tiep / Ket noi',
    'Linh kien ho tro co ban',
    'Component',
    'Electronics'
);

UPDATE listings
SET category = 'Sản phẩm mẫu và bộ kit'
WHERE category IN ('San pham mau / Bo KIT', 'SAMPLE_KIT', 'KIT', 'IOT_SAMPLE_KIT');

UPDATE listings
SET category = 'Dịch vụ IoT'
WHERE category IN ('Dich vu IOT', 'IOT_SERVICE', 'SERVICE', 'MENTORING', 'CONSULTATION', 'WORKSHOP_SLOT');

-- Backfill listing category foreign keys.
UPDATE listings l
JOIN ref_listing_categories rc ON rc.code = CASE
    WHEN TRIM(l.category) COLLATE utf8mb4_vi_0900_ai_ci IN ('Đồ dùng học tập', 'Do dung hoc tap', 'STUDY_SUPPLIES') THEN 'STUDY_SUPPLIES'
    WHEN TRIM(l.category) COLLATE utf8mb4_vi_0900_ai_ci IN ('Đồ điện tử và công nghệ', 'Do dien tu & cong nghe', 'Do dien tu va cong nghe', 'ELECTRONICS_TECH') THEN 'ELECTRONICS_TECH'
    WHEN TRIM(l.category) COLLATE utf8mb4_vi_0900_ai_ci IN ('Quần áo, giày dép, phụ kiện thời trang', 'Quan ao, giay dep, phu kien thoi trang', 'FASHION_ACCESSORIES') THEN 'FASHION_ACCESSORIES'
    WHEN TRIM(l.category) COLLATE utf8mb4_vi_0900_ai_ci IN ('Đồ dùng cá nhân và sinh hoạt', 'Do dung ca nhan & sinh hoat', 'Do dung ca nhan va sinh hoat', 'PERSONAL_LIVING') THEN 'PERSONAL_LIVING'
    WHEN TRIM(l.category) COLLATE utf8mb4_vi_0900_ai_ci IN ('Thuê - cho thuê', 'Thue - cho thue', 'RENTAL') THEN 'RENTAL'
    WHEN TRIM(l.category) COLLATE utf8mb4_vi_0900_ai_ci IN ('Dịch vụ', 'Dich vu', 'SERVICES') THEN 'SERVICES'
    WHEN TRIM(l.category) COLLATE utf8mb4_vi_0900_ai_ci IN ('Khác', 'Khac', 'OTHER') THEN 'OTHER'
    WHEN TRIM(l.category) COLLATE utf8mb4_vi_0900_ai_ci IN ('Sách', 'Sach', 'BOOKS') THEN 'BOOKS'
    WHEN TRIM(l.category) COLLATE utf8mb4_vi_0900_ai_ci IN ('Văn phòng phẩm', 'Van phong pham', 'STATIONERY') THEN 'STATIONERY'
    WHEN TRIM(l.category) COLLATE utf8mb4_vi_0900_ai_ci IN ('Đồ gia dụng', 'Do gia dung', 'HOUSEHOLD') THEN 'HOUSEHOLD'
    WHEN TRIM(l.category) COLLATE utf8mb4_vi_0900_ai_ci IN (
        'Linh kiện IoT',
        'IOT_COMPONENT',
        'Board vi dieu khien / Module phat trien',
        'Cam bien',
        'Thiet bi thuc thi / Output',
        'Module giao tiep / Ket noi',
        'Linh kien ho tro co ban',
        'Component',
        'Electronics'
    ) THEN 'IOT_COMPONENT'
    WHEN TRIM(l.category) COLLATE utf8mb4_vi_0900_ai_ci IN (
        'Sản phẩm mẫu và bộ kit',
        'San pham mau / Bo KIT',
        'SAMPLE_KIT',
        'KIT',
        'IOT_SAMPLE_KIT'
    ) THEN 'IOT_SAMPLE_KIT'
    WHEN TRIM(l.category) COLLATE utf8mb4_vi_0900_ai_ci IN (
        'Dịch vụ IoT',
        'Dich vu IOT',
        'IOT_SERVICE',
        'SERVICE',
        'MENTORING',
        'CONSULTATION',
        'WORKSHOP_SLOT'
    ) THEN 'IOT_SERVICE'
    ELSE 'OTHER'
END
SET l.category_id = rc.id;

-- Backfill IoT component category foreign keys.
UPDATE iot_components c
JOIN ref_iot_component_categories rc ON rc.code = CASE
    WHEN TRIM(c.category) COLLATE utf8mb4_vi_0900_ai_ci IN ('Board vi dieu khien / Module phat trien', 'Board vi điều khiển và module phát triển', 'CONTROLLER_BOARD') THEN 'CONTROLLER_BOARD'
    WHEN TRIM(c.category) COLLATE utf8mb4_vi_0900_ai_ci IN ('Cam bien', 'Cảm biến', 'SENSOR') THEN 'SENSOR'
    WHEN TRIM(c.category) COLLATE utf8mb4_vi_0900_ai_ci IN ('Thiet bi thuc thi / Output', 'Thiết bị thực thi và output', 'ACTUATOR') THEN 'ACTUATOR'
    WHEN TRIM(c.category) COLLATE utf8mb4_vi_0900_ai_ci IN ('Module giao tiep / Ket noi', 'Module giao tiếp và kết nối', 'CONNECTIVITY') THEN 'CONNECTIVITY'
    WHEN TRIM(c.category) COLLATE utf8mb4_vi_0900_ai_ci IN ('Linh kien ho tro co ban', 'Linh kiện hỗ trợ cơ bản', 'BASIC_PARTS') THEN 'BASIC_PARTS'
    ELSE 'OTHER_COMPONENT'
END
SET c.category_id = rc.id;

-- Backfill IoT sample category foreign keys.
UPDATE iot_sample_products s
JOIN ref_iot_sample_categories rc ON rc.code = 'SAMPLE_PROJECT'
SET s.category_id = rc.id;

-- Backfill status foreign keys.
UPDATE orders o
JOIN ref_order_statuses rs ON rs.code = UPPER(TRIM(o.status))
SET o.status_id = rs.id;

UPDATE support_tickets t
JOIN ref_support_ticket_statuses rs ON rs.code = UPPER(TRIM(t.status))
SET t.status_id = rs.id;

UPDATE event_registrations r
JOIN ref_event_registration_statuses rs ON rs.code = UPPER(TRIM(r.status))
SET r.status_id = rs.id;

-- Build catalog items for all sources.
INSERT INTO catalog_items (
    source_type,
    source_ref_id,
    title,
    description,
    price,
    stock,
    image_url,
    search_title_norm,
    search_desc_norm,
    active,
    archived_at
)
SELECT
    'LISTING',
    l.id,
    l.title,
    l.description,
    l.price,
    l.stock,
    l.image_url,
    LOWER(l.title),
    LOWER(COALESCE(l.description, '')),
    l.active,
    CASE WHEN l.active = 0 THEN COALESCE(l.archived_at, CURRENT_TIMESTAMP) ELSE l.archived_at END
FROM listings l
WHERE NOT EXISTS (
    SELECT 1 FROM catalog_items c
    WHERE c.source_type = 'LISTING' AND c.source_ref_id = l.id
);

INSERT INTO catalog_items (
    source_type,
    source_ref_id,
    title,
    description,
    price,
    stock,
    image_url,
    search_title_norm,
    search_desc_norm,
    active,
    archived_at
)
SELECT
    'IOT_COMPONENT',
    c.id,
    c.title,
    c.description,
    c.price,
    c.stock,
    c.image_url,
    LOWER(c.title),
    LOWER(COALESCE(c.description, '')),
    c.active,
    CASE WHEN c.active = 0 THEN COALESCE(c.archived_at, CURRENT_TIMESTAMP) ELSE c.archived_at END
FROM iot_components c
WHERE NOT EXISTS (
    SELECT 1 FROM catalog_items ci
    WHERE ci.source_type = 'IOT_COMPONENT' AND ci.source_ref_id = c.id
);

INSERT INTO catalog_items (
    source_type,
    source_ref_id,
    title,
    description,
    price,
    stock,
    image_url,
    search_title_norm,
    search_desc_norm,
    active,
    archived_at
)
SELECT
    'IOT_SAMPLE',
    s.id,
    s.title,
    s.description,
    s.price,
    s.stock,
    s.image_url,
    LOWER(s.title),
    LOWER(COALESCE(s.description, '')),
    s.active,
    CASE WHEN s.active = 0 THEN COALESCE(s.archived_at, CURRENT_TIMESTAMP) ELSE s.archived_at END
FROM iot_sample_products s
WHERE NOT EXISTS (
    SELECT 1 FROM catalog_items ci
    WHERE ci.source_type = 'IOT_SAMPLE' AND ci.source_ref_id = s.id
);

-- Backfill order items to catalog-backed model.
UPDATE order_items oi
JOIN catalog_items ci ON ci.source_type = 'LISTING' AND ci.source_ref_id = oi.listing_id
SET
    oi.catalog_item_id = ci.id,
    oi.source_type = 'LISTING',
    oi.source_ref_id = oi.listing_id,
    oi.item_title = COALESCE(oi.listing_title, ci.title);

-- Detailed integrity assertions are handled in tools/db-migration/validate_post_copy.sql.
