-- ============================================================
-- V6: Separate IoT listings into dedicated tables
--     iot_components  => Linh kien (components)
--     iot_sample_products => San pham mau (sample products)
-- ============================================================

-- 1. Create iot_components table
CREATE TABLE iot_components (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    title       NVARCHAR(200)  NOT NULL,
    description NVARCHAR(2000),
    category    NVARCHAR(80)   NOT NULL,
    price       DECIMAL(19,2)  NOT NULL,
    stock       INT            NOT NULL DEFAULT 0,
    image_url   NVARCHAR(MAX),
    active      BIT            NOT NULL DEFAULT 1,
    created_at  DATETIME2      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME2      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_iot_component_category ON iot_components(category);
CREATE INDEX idx_iot_component_active   ON iot_components(active);

-- 2. Create iot_sample_products table
CREATE TABLE iot_sample_products (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    title       NVARCHAR(200)  NOT NULL,
    description NVARCHAR(2000),
    price       DECIMAL(19,2)  NOT NULL,
    stock       INT            NOT NULL DEFAULT 0,
    image_url   NVARCHAR(MAX),
    active      BIT            NOT NULL DEFAULT 1,
    created_at  DATETIME2      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME2      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_iot_sample_active ON iot_sample_products(active);

-- 3. Migrate existing component listings → iot_components
INSERT INTO iot_components (title, description, category, price, stock, image_url, active, created_at, updated_at)
SELECT title, description, category, price, stock, image_url, active, created_at, updated_at
FROM listings
WHERE LOWER(category) IN (
    'board vi dieu khien / module phat trien',
    'cam bien',
    'thiet bi thuc thi / output',
    'module giao tiep / ket noi',
    'linh kien ho tro co ban',
    'component',
    'electronics'
)
AND active = 1;

-- 4. Migrate existing sample product listings → iot_sample_products
INSERT INTO iot_sample_products (title, description, price, stock, image_url, active, created_at, updated_at)
SELECT title, description, price, stock, image_url, active, created_at, updated_at
FROM listings
WHERE LOWER(category) IN (
    'san pham mau / bo kit',
    'sample_kit',
    'kit'
)
AND active = 1;

-- 5. Seed demo data if tables are empty

-- Components seed
INSERT INTO iot_components (title, description, category, price, stock, image_url, active)
SELECT 'Raspberry Pi 4 Model B 4GB',
       'Used Raspberry Pi 4, perfect for IoT projects. Includes case and power supply.',
       'Board vi dieu khien / Module phat trien',
       1200000, 1, '/products/raspberry-pi-4.jpg', 1
WHERE NOT EXISTS (SELECT 1 FROM iot_components);

INSERT INTO iot_components (title, description, category, price, stock, image_url, active)
SELECT 'ESP32 Development Board',
       'NodeMCU ESP32-WROOM-32D. Brand new.',
       'Board vi dieu khien / Module phat trien',
       150000, 10, '/products/esp32.jpg', 1
WHERE NOT EXISTS (SELECT 1 FROM iot_components WHERE title = 'ESP32 Development Board');

INSERT INTO iot_components (title, description, category, price, stock, image_url, active)
SELECT 'STM32F103C8T6 Blue Pill',
       'ARM Cortex-M3 generic board.',
       'Board vi dieu khien / Module phat trien',
       60000, 20, '/products/stm32.jpg', 1
WHERE NOT EXISTS (SELECT 1 FROM iot_components WHERE title = 'STM32F103C8T6 Blue Pill');

-- Sample products seed
INSERT INTO iot_sample_products (title, description, price, stock, image_url, active)
SELECT 'IoT Project Starter Kit',
       'Starter kit for IoT student projects with sensors and board.',
       650000, 15, '/products/raspberry-pi-4.jpg', 1
WHERE NOT EXISTS (SELECT 1 FROM iot_sample_products);
