CREATE TABLE ref_listing_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(80) NOT NULL UNIQUE,
    label_vi VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ref_iot_component_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(80) NOT NULL UNIQUE,
    label_vi VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ref_iot_sample_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(80) NOT NULL UNIQUE,
    label_vi VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ref_order_statuses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(80) NOT NULL UNIQUE,
    label_vi VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ref_support_ticket_statuses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(80) NOT NULL UNIQUE,
    label_vi VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ref_event_registration_statuses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(80) NOT NULL UNIQUE,
    label_vi VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO ref_listing_categories (code, label_vi, sort_order)
VALUES
    ('STUDY_SUPPLIES', 'Đồ dùng học tập', 10),
    ('ELECTRONICS_TECH', 'Đồ điện tử và công nghệ', 20),
    ('FASHION_ACCESSORIES', 'Quần áo, giày dép, phụ kiện thời trang', 30),
    ('PERSONAL_LIVING', 'Đồ dùng cá nhân và sinh hoạt', 40),
    ('RENTAL', 'Thuê - cho thuê', 50),
    ('SERVICES', 'Dịch vụ', 60),
    ('OTHER', 'Khác', 70),
    ('BOOKS', 'Sách', 80),
    ('STATIONERY', 'Văn phòng phẩm', 90),
    ('HOUSEHOLD', 'Đồ gia dụng', 100),
    ('IOT_COMPONENT', 'Linh kiện IoT', 110),
    ('IOT_SAMPLE_KIT', 'Sản phẩm mẫu và bộ kit', 120),
    ('IOT_SERVICE', 'Dịch vụ IoT', 130);

INSERT INTO ref_iot_component_categories (code, label_vi, sort_order)
VALUES
    ('CONTROLLER_BOARD', 'Board vi điều khiển và module phát triển', 10),
    ('SENSOR', 'Cảm biến', 20),
    ('ACTUATOR', 'Thiết bị thực thi và output', 30),
    ('CONNECTIVITY', 'Module giao tiếp và kết nối', 40),
    ('BASIC_PARTS', 'Linh kiện hỗ trợ cơ bản', 50),
    ('OTHER_COMPONENT', 'Linh kiện khác', 60);

INSERT INTO ref_iot_sample_categories (code, label_vi, sort_order)
VALUES
    ('SAMPLE_PROJECT', 'Dự án mẫu', 10);

INSERT INTO ref_order_statuses (code, label_vi, sort_order)
VALUES
    ('PENDING', 'Chờ xác nhận', 10),
    ('CONFIRMED', 'Đã xác nhận', 20),
    ('PROCESSING', 'Đang xử lý', 30),
    ('SHIPPING', 'Đang giao hàng', 40),
    ('DELIVERED', 'Đã giao hàng', 50),
    ('CANCELLED', 'Đã hủy', 60);

INSERT INTO ref_support_ticket_statuses (code, label_vi, sort_order)
VALUES
    ('PENDING', 'Chờ xử lý', 10),
    ('IN_PROGRESS', 'Đang xử lý', 20),
    ('RESOLVED', 'Đã giải quyết', 30),
    ('CLOSED', 'Đã đóng', 40);

INSERT INTO ref_event_registration_statuses (code, label_vi, sort_order)
VALUES
    ('REGISTERED', 'Đã đăng ký', 10),
    ('CONFIRMED', 'Đã xác nhận', 20),
    ('CANCELLED', 'Đã hủy', 30);
