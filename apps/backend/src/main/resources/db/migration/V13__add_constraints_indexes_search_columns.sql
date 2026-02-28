ALTER TABLE catalog_items
ADD CONSTRAINT uq_catalog_items_source UNIQUE (source_type, source_ref_id);

ALTER TABLE catalog_items
ADD CONSTRAINT ck_catalog_items_source_type CHECK (source_type IN ('LISTING', 'IOT_COMPONENT', 'IOT_SAMPLE'));

ALTER TABLE catalog_items
ADD CONSTRAINT ck_catalog_items_price CHECK (price >= 0);

ALTER TABLE catalog_items
ADD CONSTRAINT ck_catalog_items_stock CHECK (stock >= 0);

ALTER TABLE listings
ADD CONSTRAINT fk_listings_category FOREIGN KEY (category_id) REFERENCES ref_listing_categories(id);

ALTER TABLE iot_components
ADD CONSTRAINT fk_iot_components_category FOREIGN KEY (category_id) REFERENCES ref_iot_component_categories(id);

ALTER TABLE iot_sample_products
ADD CONSTRAINT fk_iot_sample_products_category FOREIGN KEY (category_id) REFERENCES ref_iot_sample_categories(id);

ALTER TABLE orders
ADD CONSTRAINT fk_orders_status FOREIGN KEY (status_id) REFERENCES ref_order_statuses(id);

ALTER TABLE support_tickets
ADD CONSTRAINT fk_support_tickets_status FOREIGN KEY (status_id) REFERENCES ref_support_ticket_statuses(id);

ALTER TABLE event_registrations
ADD CONSTRAINT fk_event_registrations_status FOREIGN KEY (status_id) REFERENCES ref_event_registration_statuses(id);

ALTER TABLE order_items
ADD CONSTRAINT fk_order_items_catalog FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id);

ALTER TABLE listings MODIFY COLUMN category_id BIGINT NOT NULL;
ALTER TABLE iot_components MODIFY COLUMN category_id BIGINT NOT NULL;
ALTER TABLE iot_sample_products MODIFY COLUMN category_id BIGINT NOT NULL;
ALTER TABLE orders MODIFY COLUMN status_id BIGINT NOT NULL;
ALTER TABLE support_tickets MODIFY COLUMN status_id BIGINT NOT NULL;
ALTER TABLE event_registrations MODIFY COLUMN status_id BIGINT NOT NULL;
ALTER TABLE order_items MODIFY COLUMN catalog_item_id BIGINT NOT NULL;
ALTER TABLE order_items MODIFY COLUMN source_type VARCHAR(30) NOT NULL;
ALTER TABLE order_items MODIFY COLUMN source_ref_id BIGINT NOT NULL;
ALTER TABLE order_items MODIFY COLUMN item_title VARCHAR(200) NOT NULL;

ALTER TABLE listings
ADD CONSTRAINT ck_listings_price_non_negative CHECK (price >= 0);

ALTER TABLE listings
ADD CONSTRAINT ck_listings_stock_non_negative CHECK (stock >= 0);

ALTER TABLE iot_components
ADD CONSTRAINT ck_iot_components_price_non_negative CHECK (price >= 0);

ALTER TABLE iot_components
ADD CONSTRAINT ck_iot_components_stock_non_negative CHECK (stock >= 0);

ALTER TABLE iot_sample_products
ADD CONSTRAINT ck_iot_sample_products_price_non_negative CHECK (price >= 0);

ALTER TABLE iot_sample_products
ADD CONSTRAINT ck_iot_sample_products_stock_non_negative CHECK (stock >= 0);

ALTER TABLE events
ADD CONSTRAINT ck_events_time_range CHECK (end_at >= start_at);

CREATE INDEX idx_catalog_items_active_archived_updated
ON catalog_items(active, archived_at, updated_at);

CREATE INDEX idx_catalog_items_search_title
ON catalog_items(search_title_norm);

CREATE INDEX idx_catalog_items_search_desc
ON catalog_items(search_desc_norm);

CREATE INDEX idx_orders_status_created
ON orders(status_id, created_at DESC);

CREATE INDEX idx_support_tickets_status_created
ON support_tickets(status_id, created_at DESC);

CREATE INDEX idx_event_registrations_event_created
ON event_registrations(event_id, created_at DESC);

CREATE INDEX idx_event_registrations_user_created
ON event_registrations(user_id, created_at DESC);

CREATE INDEX idx_listings_category_active_created
ON listings(category_id, active, created_at DESC);

CREATE INDEX idx_iot_components_category_active_created
ON iot_components(category_id, active, created_at DESC);

CREATE INDEX idx_iot_sample_products_active_created
ON iot_sample_products(active, created_at DESC);

