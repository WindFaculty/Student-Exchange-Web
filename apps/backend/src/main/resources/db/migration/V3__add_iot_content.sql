CREATE TABLE iot_page_contents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hero_title VARCHAR(200) NOT NULL,
    hero_subtitle VARCHAR(1000) NOT NULL,
    hero_image_url VARCHAR(500),
    primary_cta_label VARCHAR(120) NOT NULL,
    primary_cta_href VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE iot_highlights (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    page_content_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    icon VARCHAR(100) NOT NULL,
    display_order INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_iot_highlight_content FOREIGN KEY (page_content_id) REFERENCES iot_page_contents(id),
    CONSTRAINT uq_iot_highlight_order UNIQUE (page_content_id, display_order)
);

CREATE INDEX idx_iot_highlight_content_active ON iot_highlights(page_content_id, active);

INSERT INTO iot_page_contents (
    hero_title,
    hero_subtitle,
    hero_image_url,
    primary_cta_label,
    primary_cta_href,
    active
) VALUES (
    'IoT Hub cho sinh vien',
    'Kham pha bo kit, workshop va mentoring de xay dung du an IoT thuc te.',
    '/events/iot-workshop-1.jpg',
    'Dang san pham IoT',
    '/listings',
    1
);

INSERT INTO iot_highlights (page_content_id, title, description, icon, display_order, active)
VALUES
    ((SELECT id FROM iot_page_contents ORDER BY id DESC LIMIT 1), 'Hoc qua du an', 'Tong hop bo kit va huong dan thuc hanh tu co ban den nang cao.', 'memory', 1, 1),
    ((SELECT id FROM iot_page_contents ORDER BY id DESC LIMIT 1), 'Ket noi cong dong', 'Tham gia workshop va mentoring voi sinh vien cung dinh huong.', 'groups', 2, 1),
    ((SELECT id FROM iot_page_contents ORDER BY id DESC LIMIT 1), 'San sang trien khai', 'Lua chon tai nguyen phu hop de dua y tuong IoT vao san pham.', 'rocket_launch', 3, 1);

