ALTER TABLE orders DROP CHECK ck_orders_status;
ALTER TABLE support_tickets DROP CHECK ck_support_tickets_status;
ALTER TABLE event_registrations DROP CHECK ck_event_registrations_status;

-- Drop legacy indexes that reference old text category columns.
DROP INDEX idx_listing_category ON listings;
DROP INDEX idx_iot_component_category ON iot_components;

-- Drop old status text columns.
ALTER TABLE orders DROP COLUMN status;
ALTER TABLE support_tickets DROP COLUMN status;
ALTER TABLE event_registrations DROP COLUMN status;

-- Drop old category text columns.
ALTER TABLE listings DROP COLUMN category;
ALTER TABLE iot_components DROP COLUMN category;

-- Drop legacy listing bridge from iot_sample_products.
ALTER TABLE iot_sample_products DROP FOREIGN KEY fk_iot_sample_products_listing;
DROP INDEX idx_iot_sample_products_listing ON iot_sample_products;
ALTER TABLE iot_sample_products DROP COLUMN listing_id;

-- Drop legacy order item linkage to listings.
ALTER TABLE order_items DROP FOREIGN KEY fk_order_item_listing;
ALTER TABLE order_items DROP COLUMN listing_id;
ALTER TABLE order_items DROP COLUMN listing_title;
