-- Fix known mojibake / non-unicode listing category labels to canonical Vietnamese.
UPDATE listings
SET category = N'Đồ dùng học tập'
WHERE category IN (
    'Do dung hoc tap',
    'STUDY_SUPPLIES',
    'Äá»“ dÃ¹ng há»c táº­p',
    'Ã„ÂÃ¡Â»â€œ dÃƒÂ¹ng hÃ¡Â»Âc tÃ¡ÂºÂ­p'
);

UPDATE listings
SET category = N'Đồ điện tử và công nghệ'
WHERE category IN (
    'Do dien tu & cong nghe',
    'Do dien tu va cong nghe',
    'ELECTRONICS_TECH',
    'Äá»“ Ä‘iá»‡n tá»­ & cÃ´ng nghá»‡',
    'Äá»“ Ä‘iá»‡n tá»­ vÃ  cÃ´ng nghá»‡',
    'Ã„ÂÃ¡Â»â€œ Ã„â€˜iÃ¡Â»â€¡n tÃ¡Â»Â­ & cÃƒÂ´ng nghÃ¡Â»â€¡'
);

UPDATE listings
SET category = N'Quần áo, giày dép, phụ kiện thời trang'
WHERE category IN (
    'Quan ao, giay dep, phu kien thoi trang',
    'FASHION_ACCESSORIES',
    'Quáº§n Ã¡o, giÃ y dÃ©p, phá»¥ kiá»‡n thá»i trang',
    'QuÃ¡ÂºÂ§n ÃƒÂ¡o, giÃƒÂ y dÃƒÂ©p, phÃ¡Â»Â¥ kiÃ¡Â»â€¡n thÃ¡Â»Âi trang'
);

UPDATE listings
SET category = N'Đồ dùng cá nhân và sinh hoạt'
WHERE category IN (
    'Do dung ca nhan & sinh hoat',
    'Do dung ca nhan va sinh hoat',
    'PERSONAL_LIVING',
    'Äá»“ dÃ¹ng cÃ¡ nhÃ¢n & sinh hoáº¡t',
    'Äá»“ dÃ¹ng cÃ¡ nhÃ¢n vÃ  sinh hoáº¡t',
    'Ã„ÂÃ¡Â»â€œ dÃƒÂ¹ng cÃƒÂ¡ nhÃƒÂ¢n & sinh hoÃ¡ÂºÂ¡t'
);

UPDATE listings
SET category = N'Thuê - cho thuê'
WHERE category IN (
    'Thue - cho thue',
    'RENTAL',
    'ThuÃª - cho thuÃª',
    'ThuÃƒÂª - cho thuÃƒÂª'
);

UPDATE listings
SET category = N'Dịch vụ'
WHERE category IN (
    'Dich vu',
    'SERVICES',
    'Dá»‹ch vá»¥',
    'DÃ¡Â»â€¹ch vÃ¡Â»Â¥'
);

UPDATE listings
SET category = N'Khác'
WHERE category IN (
    'Khac',
    'OTHER',
    'KhÃ¡c',
    'KhÃƒÂ¡c'
);

UPDATE listings
SET category = N'Sách'
WHERE category IN ('SACH', 'BOOKS');

UPDATE listings
SET category = N'Văn phòng phẩm'
WHERE category IN ('VAN PHONG PHAM', 'STATIONERY');

UPDATE listings
SET category = N'Đồ gia dụng'
WHERE category IN ('DO GIA DUNG', 'HOUSEHOLD');

UPDATE listings
SET category = N'Linh kiện IoT'
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
SET category = N'Sản phẩm mẫu và bộ kit'
WHERE category IN (
    'San pham mau / Bo KIT',
    'SAMPLE_KIT',
    'KIT',
    'IOT_SAMPLE_KIT'
);

UPDATE listings
SET category = N'Dịch vụ IoT'
WHERE category IN (
    'Dich vu IOT',
    'IOT_SERVICE',
    'SERVICE',
    'MENTORING',
    'CONSULTATION',
    'WORKSHOP_SLOT'
);

-- Backfill listing category foreign keys.
UPDATE l
SET category_id = rc.id
FROM listings l
JOIN ref_listing_categories rc ON rc.code = CASE
    WHEN LTRIM(RTRIM(l.category)) COLLATE Latin1_General_100_CI_AI IN (N'Đồ dùng học tập', N'Do dung hoc tap', N'STUDY_SUPPLIES') THEN 'STUDY_SUPPLIES'
    WHEN LTRIM(RTRIM(l.category)) COLLATE Latin1_General_100_CI_AI IN (N'Đồ điện tử và công nghệ', N'Do dien tu & cong nghe', N'Do dien tu va cong nghe', N'ELECTRONICS_TECH') THEN 'ELECTRONICS_TECH'
    WHEN LTRIM(RTRIM(l.category)) COLLATE Latin1_General_100_CI_AI IN (N'Quần áo, giày dép, phụ kiện thời trang', N'Quan ao, giay dep, phu kien thoi trang', N'FASHION_ACCESSORIES') THEN 'FASHION_ACCESSORIES'
    WHEN LTRIM(RTRIM(l.category)) COLLATE Latin1_General_100_CI_AI IN (N'Đồ dùng cá nhân và sinh hoạt', N'Do dung ca nhan & sinh hoat', N'Do dung ca nhan va sinh hoat', N'PERSONAL_LIVING') THEN 'PERSONAL_LIVING'
    WHEN LTRIM(RTRIM(l.category)) COLLATE Latin1_General_100_CI_AI IN (N'Thuê - cho thuê', N'Thue - cho thue', N'RENTAL') THEN 'RENTAL'
    WHEN LTRIM(RTRIM(l.category)) COLLATE Latin1_General_100_CI_AI IN (N'Dịch vụ', N'Dich vu', N'SERVICES') THEN 'SERVICES'
    WHEN LTRIM(RTRIM(l.category)) COLLATE Latin1_General_100_CI_AI IN (N'Khác', N'Khac', N'OTHER') THEN 'OTHER'
    WHEN LTRIM(RTRIM(l.category)) COLLATE Latin1_General_100_CI_AI IN (N'Sách', N'Sach', N'BOOKS') THEN 'BOOKS'
    WHEN LTRIM(RTRIM(l.category)) COLLATE Latin1_General_100_CI_AI IN (N'Văn phòng phẩm', N'Van phong pham', N'STATIONERY') THEN 'STATIONERY'
    WHEN LTRIM(RTRIM(l.category)) COLLATE Latin1_General_100_CI_AI IN (N'Đồ gia dụng', N'Do gia dung', N'HOUSEHOLD') THEN 'HOUSEHOLD'
    WHEN LTRIM(RTRIM(l.category)) COLLATE Latin1_General_100_CI_AI IN (
        N'Linh kiện IoT',
        N'IOT_COMPONENT',
        N'Board vi dieu khien / Module phat trien',
        N'Cam bien',
        N'Thiet bi thuc thi / Output',
        N'Module giao tiep / Ket noi',
        N'Linh kien ho tro co ban',
        N'Component',
        N'Electronics'
    ) THEN 'IOT_COMPONENT'
    WHEN LTRIM(RTRIM(l.category)) COLLATE Latin1_General_100_CI_AI IN (
        N'Sản phẩm mẫu và bộ kit',
        N'San pham mau / Bo KIT',
        N'SAMPLE_KIT',
        N'KIT',
        N'IOT_SAMPLE_KIT'
    ) THEN 'IOT_SAMPLE_KIT'
    WHEN LTRIM(RTRIM(l.category)) COLLATE Latin1_General_100_CI_AI IN (
        N'Dịch vụ IoT',
        N'Dich vu IOT',
        N'IOT_SERVICE',
        N'SERVICE',
        N'MENTORING',
        N'CONSULTATION',
        N'WORKSHOP_SLOT'
    ) THEN 'IOT_SERVICE'
    ELSE 'OTHER'
END;

-- Backfill IoT component category foreign keys.
UPDATE c
SET category_id = rc.id
FROM iot_components c
JOIN ref_iot_component_categories rc ON rc.code = CASE
    WHEN LTRIM(RTRIM(c.category)) COLLATE Latin1_General_100_CI_AI IN (N'Board vi dieu khien / Module phat trien', N'Board vi điều khiển và module phát triển', N'CONTROLLER_BOARD') THEN 'CONTROLLER_BOARD'
    WHEN LTRIM(RTRIM(c.category)) COLLATE Latin1_General_100_CI_AI IN (N'Cam bien', N'Cảm biến', N'SENSOR') THEN 'SENSOR'
    WHEN LTRIM(RTRIM(c.category)) COLLATE Latin1_General_100_CI_AI IN (N'Thiet bi thuc thi / Output', N'Thiết bị thực thi và output', N'ACTUATOR') THEN 'ACTUATOR'
    WHEN LTRIM(RTRIM(c.category)) COLLATE Latin1_General_100_CI_AI IN (N'Module giao tiep / Ket noi', N'Module giao tiếp và kết nối', N'CONNECTIVITY') THEN 'CONNECTIVITY'
    WHEN LTRIM(RTRIM(c.category)) COLLATE Latin1_General_100_CI_AI IN (N'Linh kien ho tro co ban', N'Linh kiện hỗ trợ cơ bản', N'BASIC_PARTS') THEN 'BASIC_PARTS'
    ELSE 'OTHER_COMPONENT'
END;

-- Backfill IoT sample category foreign keys.
UPDATE s
SET category_id = rc.id
FROM iot_sample_products s
JOIN ref_iot_sample_categories rc ON rc.code = 'SAMPLE_PROJECT';

-- Backfill status foreign keys.
UPDATE o
SET status_id = rs.id
FROM orders o
JOIN ref_order_statuses rs ON rs.code = UPPER(LTRIM(RTRIM(o.status)));

UPDATE t
SET status_id = rs.id
FROM support_tickets t
JOIN ref_support_ticket_statuses rs ON rs.code = UPPER(LTRIM(RTRIM(t.status)));

UPDATE r
SET status_id = rs.id
FROM event_registrations r
JOIN ref_event_registration_statuses rs ON rs.code = UPPER(LTRIM(RTRIM(r.status)));

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
UPDATE oi
SET
    catalog_item_id = ci.id,
    source_type = 'LISTING',
    source_ref_id = oi.listing_id,
    item_title = COALESCE(oi.listing_title, ci.title)
FROM order_items oi
JOIN catalog_items ci ON ci.source_type = 'LISTING' AND ci.source_ref_id = oi.listing_id;

-- Validate category/status mapping completeness before NOT NULL constraints in V13.
IF EXISTS (SELECT 1 FROM listings WHERE category_id IS NULL)
BEGIN
    THROW 51001, 'Backfill validation failed: listings.category_id still has NULL values.', 1;
END;

IF EXISTS (SELECT 1 FROM iot_components WHERE category_id IS NULL)
BEGIN
    THROW 51002, 'Backfill validation failed: iot_components.category_id still has NULL values.', 1;
END;

IF EXISTS (SELECT 1 FROM iot_sample_products WHERE category_id IS NULL)
BEGIN
    THROW 51003, 'Backfill validation failed: iot_sample_products.category_id still has NULL values.', 1;
END;

IF EXISTS (SELECT 1 FROM orders WHERE status_id IS NULL)
BEGIN
    THROW 51004, 'Backfill validation failed: orders.status_id still has NULL values.', 1;
END;

IF EXISTS (SELECT 1 FROM support_tickets WHERE status_id IS NULL)
BEGIN
    THROW 51005, 'Backfill validation failed: support_tickets.status_id still has NULL values.', 1;
END;

IF EXISTS (SELECT 1 FROM event_registrations WHERE status_id IS NULL)
BEGIN
    THROW 51006, 'Backfill validation failed: event_registrations.status_id still has NULL values.', 1;
END;

IF EXISTS (
    SELECT source_type, source_ref_id
    FROM catalog_items
    GROUP BY source_type, source_ref_id
    HAVING COUNT(*) > 1
)
BEGIN
    THROW 51007, 'Backfill validation failed: duplicate catalog_items(source_type, source_ref_id).', 1;
END;

IF EXISTS (
    SELECT 1
    FROM listings l
    LEFT JOIN catalog_items ci
        ON ci.source_type = 'LISTING'
       AND ci.source_ref_id = l.id
    WHERE ci.id IS NULL
)
BEGIN
    THROW 51008, 'Backfill validation failed: missing catalog_items rows for listings.', 1;
END;

IF EXISTS (
    SELECT 1
    FROM iot_components c
    LEFT JOIN catalog_items ci
        ON ci.source_type = 'IOT_COMPONENT'
       AND ci.source_ref_id = c.id
    WHERE ci.id IS NULL
)
BEGIN
    THROW 51009, 'Backfill validation failed: missing catalog_items rows for iot_components.', 1;
END;

IF EXISTS (
    SELECT 1
    FROM iot_sample_products s
    LEFT JOIN catalog_items ci
        ON ci.source_type = 'IOT_SAMPLE'
       AND ci.source_ref_id = s.id
    WHERE ci.id IS NULL
)
BEGIN
    THROW 51010, 'Backfill validation failed: missing catalog_items rows for iot_sample_products.', 1;
END;

IF EXISTS (
    SELECT 1
    FROM catalog_items ci
    LEFT JOIN listings l
        ON ci.source_type = 'LISTING'
       AND ci.source_ref_id = l.id
    WHERE ci.source_type = 'LISTING'
      AND l.id IS NULL
)
BEGIN
    THROW 51011, 'Backfill validation failed: orphan catalog_items rows for LISTING source type.', 1;
END;

IF EXISTS (
    SELECT 1
    FROM catalog_items ci
    LEFT JOIN iot_components c
        ON ci.source_type = 'IOT_COMPONENT'
       AND ci.source_ref_id = c.id
    WHERE ci.source_type = 'IOT_COMPONENT'
      AND c.id IS NULL
)
BEGIN
    THROW 51012, 'Backfill validation failed: orphan catalog_items rows for IOT_COMPONENT source type.', 1;
END;

IF EXISTS (
    SELECT 1
    FROM catalog_items ci
    LEFT JOIN iot_sample_products s
        ON ci.source_type = 'IOT_SAMPLE'
       AND ci.source_ref_id = s.id
    WHERE ci.source_type = 'IOT_SAMPLE'
      AND s.id IS NULL
)
BEGIN
    THROW 51013, 'Backfill validation failed: orphan catalog_items rows for IOT_SAMPLE source type.', 1;
END;

IF EXISTS (
    SELECT 1
    FROM order_items
    WHERE catalog_item_id IS NULL
       OR source_type IS NULL
       OR source_ref_id IS NULL
       OR item_title IS NULL
)
BEGIN
    THROW 51014, 'Backfill validation failed: order_items catalog/source fields are not fully populated.', 1;
END;
