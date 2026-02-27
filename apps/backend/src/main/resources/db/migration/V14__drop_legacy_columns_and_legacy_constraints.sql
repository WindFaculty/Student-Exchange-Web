IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'ck_orders_status')
BEGIN
    ALTER TABLE orders DROP CONSTRAINT ck_orders_status;
END;

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'ck_support_tickets_status')
BEGIN
    ALTER TABLE support_tickets DROP CONSTRAINT ck_support_tickets_status;
END;

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'ck_event_registrations_status')
BEGIN
    ALTER TABLE event_registrations DROP CONSTRAINT ck_event_registrations_status;
END;

-- Drop legacy indexes that reference old text category columns.
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_listing_category' AND object_id = OBJECT_ID('listings'))
BEGIN
    DROP INDEX idx_listing_category ON listings;
END;

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_iot_component_category' AND object_id = OBJECT_ID('iot_components'))
BEGIN
    DROP INDEX idx_iot_component_category ON iot_components;
END;

-- Drop old status text columns.
ALTER TABLE orders DROP COLUMN status;
ALTER TABLE support_tickets DROP COLUMN status;
ALTER TABLE event_registrations DROP COLUMN status;

-- Drop old category text columns.
ALTER TABLE listings DROP COLUMN category;
ALTER TABLE iot_components DROP COLUMN category;

-- Drop legacy listing bridge from iot_sample_products.
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_iot_sample_products_listing')
BEGIN
    ALTER TABLE iot_sample_products DROP CONSTRAINT fk_iot_sample_products_listing;
END;

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_iot_sample_products_listing' AND object_id = OBJECT_ID('iot_sample_products'))
BEGIN
    DROP INDEX idx_iot_sample_products_listing ON iot_sample_products;
END;

ALTER TABLE iot_sample_products DROP COLUMN listing_id;

-- Drop legacy order item linkage to listings.
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_order_item_listing')
BEGIN
    ALTER TABLE order_items DROP CONSTRAINT fk_order_item_listing;
END;

ALTER TABLE order_items DROP COLUMN listing_id;
ALTER TABLE order_items DROP COLUMN listing_title;
