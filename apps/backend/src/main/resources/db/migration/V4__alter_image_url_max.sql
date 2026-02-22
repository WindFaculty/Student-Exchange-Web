-- Increase image_url length to support Base64 data uris

-- For Listings
ALTER TABLE listings ALTER COLUMN image_url VARCHAR(MAX);

-- For Events (just in case they need it too)
ALTER TABLE events ALTER COLUMN image_url VARCHAR(MAX);

-- For IoT Content
ALTER TABLE iot_page_contents ALTER COLUMN hero_image_url VARCHAR(MAX);
