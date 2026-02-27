CREATE TABLE ref_listing_categories (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(80) NOT NULL UNIQUE,
    label_vi NVARCHAR(255) NOT NULL,
    active BIT NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ref_iot_component_categories (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(80) NOT NULL UNIQUE,
    label_vi NVARCHAR(255) NOT NULL,
    active BIT NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ref_iot_sample_categories (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(80) NOT NULL UNIQUE,
    label_vi NVARCHAR(255) NOT NULL,
    active BIT NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ref_order_statuses (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(80) NOT NULL UNIQUE,
    label_vi NVARCHAR(255) NOT NULL,
    active BIT NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ref_support_ticket_statuses (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(80) NOT NULL UNIQUE,
    label_vi NVARCHAR(255) NOT NULL,
    active BIT NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ref_event_registration_statuses (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(80) NOT NULL UNIQUE,
    label_vi NVARCHAR(255) NOT NULL,
    active BIT NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO ref_listing_categories (code, label_vi, sort_order)
VALUES
    ('STUDY_SUPPLIES', N'Đồ dùng học tập', 10),
    ('ELECTRONICS_TECH', N'Đồ điện tử và công nghệ', 20),
    ('FASHION_ACCESSORIES', N'Quần áo, giày dép, phụ kiện thời trang', 30),
    ('PERSONAL_LIVING', N'Đồ dùng cá nhân và sinh hoạt', 40),
    ('RENTAL', N'Thuê - cho thuê', 50),
    ('SERVICES', N'Dịch vụ', 60),
    ('OTHER', N'Khác', 70),
    ('BOOKS', N'Sách', 80),
    ('STATIONERY', N'Văn phòng phẩm', 90),
    ('HOUSEHOLD', N'Đồ gia dụng', 100),
    ('IOT_COMPONENT', N'Linh kiện IoT', 110),
    ('IOT_SAMPLE_KIT', N'Sản phẩm mẫu và bộ kit', 120),
    ('IOT_SERVICE', N'Dịch vụ IoT', 130);

INSERT INTO ref_iot_component_categories (code, label_vi, sort_order)
VALUES
    ('CONTROLLER_BOARD', N'Board vi điều khiển và module phát triển', 10),
    ('SENSOR', N'Cảm biến', 20),
    ('ACTUATOR', N'Thiết bị thực thi và output', 30),
    ('CONNECTIVITY', N'Module giao tiếp và kết nối', 40),
    ('BASIC_PARTS', N'Linh kiện hỗ trợ cơ bản', 50),
    ('OTHER_COMPONENT', N'Linh kiện khác', 60);

INSERT INTO ref_iot_sample_categories (code, label_vi, sort_order)
VALUES
    ('SAMPLE_PROJECT', N'Dự án mẫu', 10);

INSERT INTO ref_order_statuses (code, label_vi, sort_order)
VALUES
    ('PENDING', N'Chờ xác nhận', 10),
    ('CONFIRMED', N'Đã xác nhận', 20),
    ('PROCESSING', N'Đang xử lý', 30),
    ('SHIPPING', N'Đang giao hàng', 40),
    ('DELIVERED', N'Đã giao hàng', 50),
    ('CANCELLED', N'Đã hủy', 60);

INSERT INTO ref_support_ticket_statuses (code, label_vi, sort_order)
VALUES
    ('PENDING', N'Chờ xử lý', 10),
    ('IN_PROGRESS', N'Đang xử lý', 20),
    ('RESOLVED', N'Đã giải quyết', 30),
    ('CLOSED', N'Đã đóng', 40);

INSERT INTO ref_event_registration_statuses (code, label_vi, sort_order)
VALUES
    ('REGISTERED', N'Đã đăng ký', 10),
    ('CONFIRMED', N'Đã xác nhận', 20),
    ('CANCELLED', N'Đã hủy', 30);
