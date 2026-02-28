-- Increase image_url length to support Base64 data uris

-- For Listings
ALTER TABLE listings MODIFY COLUMN image_url LONGTEXT;

-- For Events (just in case they need it too)
ALTER TABLE events MODIFY COLUMN image_url LONGTEXT;

-- For IoT Content
ALTER TABLE iot_page_contents MODIFY COLUMN hero_image_url LONGTEXT;

