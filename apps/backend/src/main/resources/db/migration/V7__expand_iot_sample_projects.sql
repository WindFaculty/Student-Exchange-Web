-- ============================================================
-- V7: Expand IoT sample products into project catalog
--     - Add project metadata fields
--     - Link each project to a listing for commerce flow
--     - Seed 8 sample IoT projects from EXPORT_MANIFEST + README (2)
-- ============================================================

ALTER TABLE iot_sample_products ADD slug NVARCHAR(120);
ALTER TABLE iot_sample_products ADD summary NVARCHAR(1200);
ALTER TABLE iot_sample_products ADD main_components NVARCHAR(2000);
ALTER TABLE iot_sample_products ADD difficulty NVARCHAR(40);
ALTER TABLE iot_sample_products ADD build_time NVARCHAR(80);
ALTER TABLE iot_sample_products ADD mcu_soc NVARCHAR(120);
ALTER TABLE iot_sample_products ADD connectivity NVARCHAR(120);
ALTER TABLE iot_sample_products ADD project_path NVARCHAR(255);
ALTER TABLE iot_sample_products ADD readme_path NVARCHAR(255);
ALTER TABLE iot_sample_products ADD pinout_path NVARCHAR(255);
ALTER TABLE iot_sample_products ADD principle_path NVARCHAR(255);
ALTER TABLE iot_sample_products ADD sources_path NVARCHAR(255);
ALTER TABLE iot_sample_products ADD listing_id BIGINT;


-- Backfill existing rows so new NOT NULL constraints can be applied safely.
UPDATE iot_sample_products
SET
    slug = COALESCE(slug, CONCAT('legacy_sample_', CAST(id AS NVARCHAR(20)))),
    summary = COALESCE(summary, title),
    main_components = COALESCE(main_components, 'IoT Component'),
    difficulty = COALESCE(difficulty, 'Intermediate'),
    build_time = COALESCE(build_time, 'N/A'),
    mcu_soc = COALESCE(mcu_soc, 'ESP32'),
    connectivity = COALESCE(connectivity, 'Wi-Fi'),
    project_path = COALESCE(project_path, CONCAT('legacy/projects/', CAST(id AS NVARCHAR(20)))),
    readme_path = COALESCE(readme_path, 'legacy/README.md'),
    pinout_path = COALESCE(pinout_path, 'legacy/pinout.md'),
    principle_path = COALESCE(principle_path, 'legacy/principle_of_operation.md'),
    sources_path = COALESCE(sources_path, 'legacy/sources.md')
WHERE slug IS NULL
   OR main_components IS NULL
   OR project_path IS NULL;

ALTER TABLE iot_sample_products ALTER COLUMN slug NVARCHAR(120) NOT NULL;
ALTER TABLE iot_sample_products ALTER COLUMN main_components NVARCHAR(2000) NOT NULL;
ALTER TABLE iot_sample_products ALTER COLUMN project_path NVARCHAR(255) NOT NULL;
ALTER TABLE iot_sample_products ALTER COLUMN readme_path NVARCHAR(255) NOT NULL;
ALTER TABLE iot_sample_products ALTER COLUMN pinout_path NVARCHAR(255) NOT NULL;
ALTER TABLE iot_sample_products ALTER COLUMN principle_path NVARCHAR(255) NOT NULL;
ALTER TABLE iot_sample_products ALTER COLUMN sources_path NVARCHAR(255) NOT NULL;

ALTER TABLE iot_sample_products
    ADD CONSTRAINT uq_iot_sample_products_slug UNIQUE (slug);

ALTER TABLE iot_sample_products
    ADD CONSTRAINT fk_iot_sample_products_listing
        FOREIGN KEY (listing_id) REFERENCES listings(id);

CREATE INDEX idx_iot_sample_products_slug ON iot_sample_products(slug);
CREATE INDEX idx_iot_sample_products_listing ON iot_sample_products(listing_id);

-- Hide legacy seed rows from public sample-project catalog.
UPDATE iot_sample_products
SET active = 0;

-- ------------------------------------------------------------
-- Seed listings for 8 IoT sample projects
-- ------------------------------------------------------------
INSERT INTO listings (title, description, category, price, stock, image_url, active, owner_id)
SELECT 'Smart Plant Watering System',
       'Automated plant watering using soil moisture sensor and relay-driven pump.',
       'San pham mau / Bo KIT',
       850000, 8, '/products/esp32.jpg', 1,
       (SELECT MIN(id) FROM users WHERE role = 'ADMIN' AND active = 1)
WHERE NOT EXISTS (
    SELECT 1 FROM listings
    WHERE LOWER(title) = LOWER('Smart Plant Watering System')
      AND LOWER(category) = LOWER('San pham mau / Bo KIT')
);

INSERT INTO listings (title, description, category, price, stock, image_url, active, owner_id)
SELECT 'Home Environment Monitor',
       'Monitor temperature, humidity and pressure with OLED and MQTT output.',
       'San pham mau / Bo KIT',
       720000, 8, '/products/esp32.jpg', 1,
       (SELECT MIN(id) FROM users WHERE role = 'ADMIN' AND active = 1)
WHERE NOT EXISTS (
    SELECT 1 FROM listings
    WHERE LOWER(title) = LOWER('Home Environment Monitor')
      AND LOWER(category) = LOWER('San pham mau / Bo KIT')
);

INSERT INTO listings (title, description, category, price, stock, image_url, active, owner_id)
SELECT 'Smart Door Lock with RFID',
       'RFID-based smart door lock controlled by servo motor.',
       'San pham mau / Bo KIT',
       980000, 6, '/products/esp32.jpg', 1,
       (SELECT MIN(id) FROM users WHERE role = 'ADMIN' AND active = 1)
WHERE NOT EXISTS (
    SELECT 1 FROM listings
    WHERE LOWER(title) = LOWER('Smart Door Lock with RFID')
      AND LOWER(category) = LOWER('San pham mau / Bo KIT')
);

INSERT INTO listings (title, description, category, price, stock, image_url, active, owner_id)
SELECT 'Energy Monitoring Smart Plug',
       'Monitor current/voltage usage and control appliance by relay.',
       'San pham mau / Bo KIT',
       1050000, 5, '/products/esp32.jpg', 1,
       (SELECT MIN(id) FROM users WHERE role = 'ADMIN' AND active = 1)
WHERE NOT EXISTS (
    SELECT 1 FROM listings
    WHERE LOWER(title) = LOWER('Energy Monitoring Smart Plug')
      AND LOWER(category) = LOWER('San pham mau / Bo KIT')
);

INSERT INTO listings (title, description, category, price, stock, image_url, active, owner_id)
SELECT 'Garage Parking Assistant',
       'Ultrasonic sensor measures distance and indicates safe parking position.',
       'San pham mau / Bo KIT',
       680000, 7, '/products/hc-sr04.png', 1,
       (SELECT MIN(id) FROM users WHERE role = 'ADMIN' AND active = 1)
WHERE NOT EXISTS (
    SELECT 1 FROM listings
    WHERE LOWER(title) = LOWER('Garage Parking Assistant')
      AND LOWER(category) = LOWER('San pham mau / Bo KIT')
);

INSERT INTO listings (title, description, category, price, stock, image_url, active, owner_id)
SELECT 'LoRa Weather Station',
       'LoRa node/gateway setup for remote environmental monitoring.',
       'San pham mau / Bo KIT',
       1250000, 4, '/products/esp32.jpg', 1,
       (SELECT MIN(id) FROM users WHERE role = 'ADMIN' AND active = 1)
WHERE NOT EXISTS (
    SELECT 1 FROM listings
    WHERE LOWER(title) = LOWER('LoRa Weather Station')
      AND LOWER(category) = LOWER('San pham mau / Bo KIT')
);

INSERT INTO listings (title, description, category, price, stock, image_url, active, owner_id)
SELECT 'Raspberry Pi Surveillance Camera',
       'Motion-triggered surveillance with PIR sensor and camera module.',
       'San pham mau / Bo KIT',
       1850000, 3, '/products/raspberry-pi-4.jpg', 1,
       (SELECT MIN(id) FROM users WHERE role = 'ADMIN' AND active = 1)
WHERE NOT EXISTS (
    SELECT 1 FROM listings
    WHERE LOWER(title) = LOWER('Raspberry Pi Surveillance Camera')
      AND LOWER(category) = LOWER('San pham mau / Bo KIT')
);

INSERT INTO listings (title, description, category, price, stock, image_url, active, owner_id)
SELECT 'Raspberry Pi Smart Garden Monitor',
       'Monitor garden conditions and control watering pump with Raspberry Pi.',
       'San pham mau / Bo KIT',
       1650000, 3, '/products/raspberry-pi-4.jpg', 1,
       (SELECT MIN(id) FROM users WHERE role = 'ADMIN' AND active = 1)
WHERE NOT EXISTS (
    SELECT 1 FROM listings
    WHERE LOWER(title) = LOWER('Raspberry Pi Smart Garden Monitor')
      AND LOWER(category) = LOWER('San pham mau / Bo KIT')
);

-- ------------------------------------------------------------
-- Seed sample projects and map listing_id
-- ------------------------------------------------------------

INSERT INTO iot_sample_products (
    title, slug, summary, description, main_components,
    difficulty, build_time, mcu_soc, connectivity,
    project_path, readme_path, pinout_path, principle_path, sources_path,
    listing_id, price, stock, image_url, active
)
SELECT
    'Smart Plant Watering System',
    '01_smart_plant_watering',
    'Automated plant watering for potted plants using moisture threshold logic.',
    'Automated plant watering using soil moisture sensor and pump controlled via relay.',
    'Capacitive Soil Moisture Sensor|Relay Module|Water Pump',
    'Intermediate',
    '3-4 hours',
    'ESP32',
    'Wi-Fi',
    'projects/01_smart_plant_watering',
    'projects/01_smart_plant_watering/README.md',
    'projects/01_smart_plant_watering/pinout.md',
    'projects/01_smart_plant_watering/principle_of_operation.md',
    'projects/01_smart_plant_watering/sources.md',
    (SELECT MIN(id) FROM listings WHERE LOWER(title) = LOWER('Smart Plant Watering System') AND LOWER(category) = LOWER('San pham mau / Bo KIT')),
    850000, 8, '/products/esp32.jpg', 1
WHERE NOT EXISTS (SELECT 1 FROM iot_sample_products WHERE slug = '01_smart_plant_watering');

INSERT INTO iot_sample_products (
    title, slug, summary, description, main_components,
    difficulty, build_time, mcu_soc, connectivity,
    project_path, readme_path, pinout_path, principle_path, sources_path,
    listing_id, price, stock, image_url, active
)
SELECT
    'Home Environment Monitor',
    '02_home_env_monitor',
    'Indoor environment monitor with OLED dashboard and telemetry output.',
    'Monitor temperature, humidity and pressure and display on OLED and publish via MQTT.',
    'BME280|OLED Display',
    'Easy',
    '2-3 hours',
    'ESP32',
    'Wi-Fi',
    'projects/02_home_env_monitor',
    'projects/02_home_env_monitor/README.md',
    'projects/02_home_env_monitor/pinout.md',
    'projects/02_home_env_monitor/principle_of_operation.md',
    'projects/02_home_env_monitor/sources.md',
    (SELECT MIN(id) FROM listings WHERE LOWER(title) = LOWER('Home Environment Monitor') AND LOWER(category) = LOWER('San pham mau / Bo KIT')),
    720000, 8, '/products/esp32.jpg', 1
WHERE NOT EXISTS (SELECT 1 FROM iot_sample_products WHERE slug = '02_home_env_monitor');

INSERT INTO iot_sample_products (
    title, slug, summary, description, main_components,
    difficulty, build_time, mcu_soc, connectivity,
    project_path, readme_path, pinout_path, principle_path, sources_path,
    listing_id, price, stock, image_url, active
)
SELECT
    'Smart Door Lock with RFID',
    '03_smart_door_lock',
    'RFID access control prototype with servo-based lock mechanism.',
    'RFID-based smart door lock controlled by servo motor.',
    'RC522 RFID Reader|SG90 Servo',
    'Intermediate',
    '4 hours',
    'ESP32',
    'Wi-Fi',
    'projects/03_smart_door_lock',
    'projects/03_smart_door_lock/README.md',
    'projects/03_smart_door_lock/pinout.md',
    'projects/03_smart_door_lock/principle_of_operation.md',
    'projects/03_smart_door_lock/sources.md',
    (SELECT MIN(id) FROM listings WHERE LOWER(title) = LOWER('Smart Door Lock with RFID') AND LOWER(category) = LOWER('San pham mau / Bo KIT')),
    980000, 6, '/products/esp32.jpg', 1
WHERE NOT EXISTS (SELECT 1 FROM iot_sample_products WHERE slug = '03_smart_door_lock');

INSERT INTO iot_sample_products (
    title, slug, summary, description, main_components,
    difficulty, build_time, mcu_soc, connectivity,
    project_path, readme_path, pinout_path, principle_path, sources_path,
    listing_id, price, stock, image_url, active
)
SELECT
    'Energy Monitoring Smart Plug',
    '04_energy_monitoring_plug',
    'Measure appliance power and switch relay remotely for energy control.',
    'Monitor current and voltage of an appliance and control it via relay.',
    'INA219 Current Sensor|Relay Module',
    'Intermediate',
    '3-4 hours',
    'ESP32',
    'Wi-Fi',
    'projects/04_energy_monitoring_plug',
    'projects/04_energy_monitoring_plug/README.md',
    'projects/04_energy_monitoring_plug/pinout.md',
    'projects/04_energy_monitoring_plug/principle_of_operation.md',
    'projects/04_energy_monitoring_plug/sources.md',
    (SELECT MIN(id) FROM listings WHERE LOWER(title) = LOWER('Energy Monitoring Smart Plug') AND LOWER(category) = LOWER('San pham mau / Bo KIT')),
    1050000, 5, '/products/esp32.jpg', 1
WHERE NOT EXISTS (SELECT 1 FROM iot_sample_products WHERE slug = '04_energy_monitoring_plug');

INSERT INTO iot_sample_products (
    title, slug, summary, description, main_components,
    difficulty, build_time, mcu_soc, connectivity,
    project_path, readme_path, pinout_path, principle_path, sources_path,
    listing_id, price, stock, image_url, active
)
SELECT
    'Garage Parking Assistant',
    '05_garage_parking_assistant',
    'Distance-guided parking helper with buzzer/LED indication.',
    'Ultrasonic sensor measures distance to wall and indicates safe distance via LEDs/buzzer.',
    'HC-SR04 Ultrasonic Sensor|Buzzer / LEDs',
    'Easy',
    '2 hours',
    'ESP32',
    'Wi-Fi (optional)',
    'projects/05_garage_parking_assistant',
    'projects/05_garage_parking_assistant/README.md',
    'projects/05_garage_parking_assistant/pinout.md',
    'projects/05_garage_parking_assistant/principle_of_operation.md',
    'projects/05_garage_parking_assistant/sources.md',
    (SELECT MIN(id) FROM listings WHERE LOWER(title) = LOWER('Garage Parking Assistant') AND LOWER(category) = LOWER('San pham mau / Bo KIT')),
    680000, 7, '/products/hc-sr04.png', 1
WHERE NOT EXISTS (SELECT 1 FROM iot_sample_products WHERE slug = '05_garage_parking_assistant');

INSERT INTO iot_sample_products (
    title, slug, summary, description, main_components,
    difficulty, build_time, mcu_soc, connectivity,
    project_path, readme_path, pinout_path, principle_path, sources_path,
    listing_id, price, stock, image_url, active
)
SELECT
    'LoRa Weather Station',
    '06_lora_weather_station',
    'Long-range weather telemetry using LoRa node and gateway architecture.',
    'Send environmental data via LoRa between remote sensor node and base station.',
    'BME280|OLED Display (gateway)',
    'Intermediate',
    '4-5 hours',
    'ESP32 (TTGO LoRa32)',
    'LoRa and Wi-Fi',
    'projects/06_lora_weather_station',
    'projects/06_lora_weather_station/README.md',
    'projects/06_lora_weather_station/pinout.md',
    'projects/06_lora_weather_station/principle_of_operation.md',
    'projects/06_lora_weather_station/sources.md',
    (SELECT MIN(id) FROM listings WHERE LOWER(title) = LOWER('LoRa Weather Station') AND LOWER(category) = LOWER('San pham mau / Bo KIT')),
    1250000, 4, '/products/esp32.jpg', 1
WHERE NOT EXISTS (SELECT 1 FROM iot_sample_products WHERE slug = '06_lora_weather_station');

INSERT INTO iot_sample_products (
    title, slug, summary, description, main_components,
    difficulty, build_time, mcu_soc, connectivity,
    project_path, readme_path, pinout_path, principle_path, sources_path,
    listing_id, price, stock, image_url, active
)
SELECT
    'Raspberry Pi Surveillance Camera',
    '07_rpi_surveillance_cam',
    'Motion-triggered surveillance stream with alert buzzer support.',
    'Motion-triggered surveillance system using PIR sensor and camera with web streaming.',
    'PIR Motion Sensor|Camera Module|Buzzer',
    'Intermediate',
    '4-5 hours',
    'Raspberry Pi 4',
    'Wi-Fi/Ethernet',
    'projects/07_rpi_surveillance_cam',
    'projects/07_rpi_surveillance_cam/README.md',
    'projects/07_rpi_surveillance_cam/pinout.md',
    'projects/07_rpi_surveillance_cam/principle_of_operation.md',
    'projects/07_rpi_surveillance_cam/sources.md',
    (SELECT MIN(id) FROM listings WHERE LOWER(title) = LOWER('Raspberry Pi Surveillance Camera') AND LOWER(category) = LOWER('San pham mau / Bo KIT')),
    1850000, 3, '/products/raspberry-pi-4.jpg', 1
WHERE NOT EXISTS (SELECT 1 FROM iot_sample_products WHERE slug = '07_rpi_surveillance_cam');

INSERT INTO iot_sample_products (
    title, slug, summary, description, main_components,
    difficulty, build_time, mcu_soc, connectivity,
    project_path, readme_path, pinout_path, principle_path, sources_path,
    listing_id, price, stock, image_url, active
)
SELECT
    'Raspberry Pi Smart Garden Monitor',
    '08_rpi_smart_garden',
    'Raspberry Pi garden monitor with automated watering control loop.',
    'Monitor soil moisture, temperature and humidity and control watering pump via relay.',
    'Capacitive Soil Moisture Sensor|DHT22 Temperature/Humidity Sensor|Relay Module|Water Pump',
    'Intermediate',
    '4 hours',
    'Raspberry Pi 4',
    'Wi-Fi',
    'projects/08_rpi_smart_garden',
    'projects/08_rpi_smart_garden/README.md',
    'projects/08_rpi_smart_garden/pinout.md',
    'projects/08_rpi_smart_garden/principle_of_operation.md',
    'projects/08_rpi_smart_garden/sources.md',
    (SELECT MIN(id) FROM listings WHERE LOWER(title) = LOWER('Raspberry Pi Smart Garden Monitor') AND LOWER(category) = LOWER('San pham mau / Bo KIT')),
    1650000, 3, '/products/raspberry-pi-4.jpg', 1
WHERE NOT EXISTS (SELECT 1 FROM iot_sample_products WHERE slug = '08_rpi_smart_garden');

