-- Post-copy validation for MySQL target database.
-- Expected result: all failed_rows = 0 and validation_status = PASS.

SELECT 'listings.category_id_nulls' AS check_name, COUNT(*) AS failed_rows
FROM listings
WHERE category_id IS NULL
UNION ALL
SELECT 'iot_components.category_id_nulls', COUNT(*)
FROM iot_components
WHERE category_id IS NULL
UNION ALL
SELECT 'iot_sample_products.category_id_nulls', COUNT(*)
FROM iot_sample_products
WHERE category_id IS NULL
UNION ALL
SELECT 'orders.status_id_nulls', COUNT(*)
FROM orders
WHERE status_id IS NULL
UNION ALL
SELECT 'support_tickets.status_id_nulls', COUNT(*)
FROM support_tickets
WHERE status_id IS NULL
UNION ALL
SELECT 'event_registrations.status_id_nulls', COUNT(*)
FROM event_registrations
WHERE status_id IS NULL
UNION ALL
SELECT 'order_items.catalog_mapping_nulls', COUNT(*)
FROM order_items
WHERE catalog_item_id IS NULL
   OR source_type IS NULL
   OR source_ref_id IS NULL
   OR item_title IS NULL
UNION ALL
SELECT 'catalog_items.duplicate_source_pairs', COUNT(*)
FROM (
    SELECT source_type, source_ref_id
    FROM catalog_items
    GROUP BY source_type, source_ref_id
    HAVING COUNT(*) > 1
) d
UNION ALL
SELECT 'catalog_items.orphan_listing', COUNT(*)
FROM catalog_items ci
LEFT JOIN listings l
    ON ci.source_type = 'LISTING'
   AND ci.source_ref_id = l.id
WHERE ci.source_type = 'LISTING'
  AND l.id IS NULL
UNION ALL
SELECT 'catalog_items.orphan_iot_component', COUNT(*)
FROM catalog_items ci
LEFT JOIN iot_components c
    ON ci.source_type = 'IOT_COMPONENT'
   AND ci.source_ref_id = c.id
WHERE ci.source_type = 'IOT_COMPONENT'
  AND c.id IS NULL
UNION ALL
SELECT 'catalog_items.orphan_iot_sample', COUNT(*)
FROM catalog_items ci
LEFT JOIN iot_sample_products s
    ON ci.source_type = 'IOT_SAMPLE'
   AND ci.source_ref_id = s.id
WHERE ci.source_type = 'IOT_SAMPLE'
  AND s.id IS NULL;

SELECT
    CASE WHEN SUM(failed_rows) = 0 THEN 'PASS' ELSE 'FAIL' END AS validation_status,
    SUM(failed_rows) AS total_failed_rows
FROM (
    SELECT COUNT(*) AS failed_rows FROM listings WHERE category_id IS NULL
    UNION ALL
    SELECT COUNT(*) FROM iot_components WHERE category_id IS NULL
    UNION ALL
    SELECT COUNT(*) FROM iot_sample_products WHERE category_id IS NULL
    UNION ALL
    SELECT COUNT(*) FROM orders WHERE status_id IS NULL
    UNION ALL
    SELECT COUNT(*) FROM support_tickets WHERE status_id IS NULL
    UNION ALL
    SELECT COUNT(*) FROM event_registrations WHERE status_id IS NULL
    UNION ALL
    SELECT COUNT(*) FROM order_items
    WHERE catalog_item_id IS NULL
       OR source_type IS NULL
       OR source_ref_id IS NULL
       OR item_title IS NULL
    UNION ALL
    SELECT COUNT(*) FROM (
        SELECT source_type, source_ref_id
        FROM catalog_items
        GROUP BY source_type, source_ref_id
        HAVING COUNT(*) > 1
    ) duplicates
    UNION ALL
    SELECT COUNT(*)
    FROM catalog_items ci
    LEFT JOIN listings l
        ON ci.source_type = 'LISTING'
       AND ci.source_ref_id = l.id
    WHERE ci.source_type = 'LISTING'
      AND l.id IS NULL
    UNION ALL
    SELECT COUNT(*)
    FROM catalog_items ci
    LEFT JOIN iot_components c
        ON ci.source_type = 'IOT_COMPONENT'
       AND ci.source_ref_id = c.id
    WHERE ci.source_type = 'IOT_COMPONENT'
      AND c.id IS NULL
    UNION ALL
    SELECT COUNT(*)
    FROM catalog_items ci
    LEFT JOIN iot_sample_products s
        ON ci.source_type = 'IOT_SAMPLE'
       AND ci.source_ref_id = s.id
    WHERE ci.source_type = 'IOT_SAMPLE'
      AND s.id IS NULL
) totals;

SELECT 'ref_listing_categories' AS table_name, COUNT(*) AS row_count FROM ref_listing_categories
UNION ALL SELECT 'ref_iot_component_categories', COUNT(*) FROM ref_iot_component_categories
UNION ALL SELECT 'ref_iot_sample_categories', COUNT(*) FROM ref_iot_sample_categories
UNION ALL SELECT 'ref_order_statuses', COUNT(*) FROM ref_order_statuses
UNION ALL SELECT 'ref_support_ticket_statuses', COUNT(*) FROM ref_support_ticket_statuses
UNION ALL SELECT 'ref_event_registration_statuses', COUNT(*) FROM ref_event_registration_statuses
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'listings', COUNT(*) FROM listings
UNION ALL SELECT 'iot_components', COUNT(*) FROM iot_components
UNION ALL SELECT 'iot_sample_products', COUNT(*) FROM iot_sample_products
UNION ALL SELECT 'catalog_items', COUNT(*) FROM catalog_items
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'events', COUNT(*) FROM events
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'event_registrations', COUNT(*) FROM event_registrations
UNION ALL SELECT 'faqs', COUNT(*) FROM faqs
UNION ALL SELECT 'support_tickets', COUNT(*) FROM support_tickets
UNION ALL SELECT 'iot_page_contents', COUNT(*) FROM iot_page_contents
UNION ALL SELECT 'iot_highlights', COUNT(*) FROM iot_highlights;
