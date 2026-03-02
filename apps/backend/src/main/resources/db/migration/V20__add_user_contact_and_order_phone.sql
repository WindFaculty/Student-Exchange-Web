ALTER TABLE users
    ADD COLUMN phone VARCHAR(40) NULL AFTER email;

ALTER TABLE users
    ADD COLUMN address VARCHAR(500) NULL AFTER phone;

ALTER TABLE orders
    ADD COLUMN customer_phone VARCHAR(40) NOT NULL DEFAULT '' AFTER customer_address;
