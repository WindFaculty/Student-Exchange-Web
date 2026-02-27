ALTER TABLE listings ADD category_id BIGINT NULL;
ALTER TABLE listings ADD archived_at DATETIME2 NULL;

ALTER TABLE iot_components ADD category_id BIGINT NULL;
ALTER TABLE iot_components ADD archived_at DATETIME2 NULL;

ALTER TABLE iot_sample_products ADD category_id BIGINT NULL;
ALTER TABLE iot_sample_products ADD archived_at DATETIME2 NULL;

ALTER TABLE orders ADD status_id BIGINT NULL;
ALTER TABLE support_tickets ADD status_id BIGINT NULL;
ALTER TABLE event_registrations ADD status_id BIGINT NULL;

ALTER TABLE order_items ADD catalog_item_id BIGINT NULL;
ALTER TABLE order_items ADD source_type NVARCHAR(30) NULL;
ALTER TABLE order_items ADD source_ref_id BIGINT NULL;
ALTER TABLE order_items ADD item_title NVARCHAR(200) NULL;
