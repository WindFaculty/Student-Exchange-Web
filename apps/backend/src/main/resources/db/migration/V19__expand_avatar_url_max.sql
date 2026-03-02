-- Increase avatar_url length to support Base64 data URIs
ALTER TABLE users MODIFY COLUMN avatar_url LONGTEXT NULL;
