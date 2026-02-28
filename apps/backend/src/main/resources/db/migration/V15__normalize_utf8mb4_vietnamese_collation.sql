-- Ensure all text data uses utf8mb4 with Vietnamese collation.
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;
ALTER TABLE listings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;
ALTER TABLE orders CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;
ALTER TABLE order_items CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;
ALTER TABLE events CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;
ALTER TABLE event_registrations CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;
ALTER TABLE faqs CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;
ALTER TABLE support_tickets CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;
ALTER TABLE iot_page_contents CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;
ALTER TABLE iot_highlights CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;
ALTER TABLE iot_components CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;
ALTER TABLE iot_sample_products CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;
ALTER TABLE catalog_items CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;
ALTER TABLE ref_listing_categories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;
ALTER TABLE ref_iot_component_categories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;
ALTER TABLE ref_iot_sample_categories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;
ALTER TABLE ref_order_statuses CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;
ALTER TABLE ref_support_ticket_statuses CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;
ALTER TABLE ref_event_registration_statuses CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_vi_0900_ai_ci;

-- Repair Vietnamese labels for DBs already migrated with mojibake text.
UPDATE ref_listing_categories SET label_vi = 'Đồ dùng học tập' WHERE code = 'STUDY_SUPPLIES';
UPDATE ref_listing_categories SET label_vi = 'Đồ điện tử và công nghệ' WHERE code = 'ELECTRONICS_TECH';
UPDATE ref_listing_categories SET label_vi = 'Quần áo, giày dép, phụ kiện thời trang' WHERE code = 'FASHION_ACCESSORIES';
UPDATE ref_listing_categories SET label_vi = 'Đồ dùng cá nhân và sinh hoạt' WHERE code = 'PERSONAL_LIVING';
UPDATE ref_listing_categories SET label_vi = 'Thuê - cho thuê' WHERE code = 'RENTAL';
UPDATE ref_listing_categories SET label_vi = 'Dịch vụ' WHERE code = 'SERVICES';
UPDATE ref_listing_categories SET label_vi = 'Khác' WHERE code = 'OTHER';
UPDATE ref_listing_categories SET label_vi = 'Sách' WHERE code = 'BOOKS';
UPDATE ref_listing_categories SET label_vi = 'Văn phòng phẩm' WHERE code = 'STATIONERY';
UPDATE ref_listing_categories SET label_vi = 'Đồ gia dụng' WHERE code = 'HOUSEHOLD';
UPDATE ref_listing_categories SET label_vi = 'Linh kiện IoT' WHERE code = 'IOT_COMPONENT';
UPDATE ref_listing_categories SET label_vi = 'Sản phẩm mẫu và bộ kit' WHERE code = 'IOT_SAMPLE_KIT';
UPDATE ref_listing_categories SET label_vi = 'Dịch vụ IoT' WHERE code = 'IOT_SERVICE';

UPDATE ref_iot_component_categories SET label_vi = 'Board vi điều khiển và module phát triển' WHERE code = 'CONTROLLER_BOARD';
UPDATE ref_iot_component_categories SET label_vi = 'Cảm biến' WHERE code = 'SENSOR';
UPDATE ref_iot_component_categories SET label_vi = 'Thiết bị thực thi và output' WHERE code = 'ACTUATOR';
UPDATE ref_iot_component_categories SET label_vi = 'Module giao tiếp và kết nối' WHERE code = 'CONNECTIVITY';
UPDATE ref_iot_component_categories SET label_vi = 'Linh kiện hỗ trợ cơ bản' WHERE code = 'BASIC_PARTS';
UPDATE ref_iot_component_categories SET label_vi = 'Linh kiện khác' WHERE code = 'OTHER_COMPONENT';

UPDATE ref_iot_sample_categories SET label_vi = 'Dự án mẫu' WHERE code = 'SAMPLE_PROJECT';

UPDATE ref_order_statuses SET label_vi = 'Chờ xác nhận' WHERE code = 'PENDING';
UPDATE ref_order_statuses SET label_vi = 'Đã xác nhận' WHERE code = 'CONFIRMED';
UPDATE ref_order_statuses SET label_vi = 'Đang xử lý' WHERE code = 'PROCESSING';
UPDATE ref_order_statuses SET label_vi = 'Đang giao hàng' WHERE code = 'SHIPPING';
UPDATE ref_order_statuses SET label_vi = 'Đã giao hàng' WHERE code = 'DELIVERED';
UPDATE ref_order_statuses SET label_vi = 'Đã hủy' WHERE code = 'CANCELLED';

UPDATE ref_support_ticket_statuses SET label_vi = 'Chờ xử lý' WHERE code = 'PENDING';
UPDATE ref_support_ticket_statuses SET label_vi = 'Đang xử lý' WHERE code = 'IN_PROGRESS';
UPDATE ref_support_ticket_statuses SET label_vi = 'Đã giải quyết' WHERE code = 'RESOLVED';
UPDATE ref_support_ticket_statuses SET label_vi = 'Đã đóng' WHERE code = 'CLOSED';

UPDATE ref_event_registration_statuses SET label_vi = 'Đã đăng ký' WHERE code = 'REGISTERED';
UPDATE ref_event_registration_statuses SET label_vi = 'Đã xác nhận' WHERE code = 'CONFIRMED';
UPDATE ref_event_registration_statuses SET label_vi = 'Đã hủy' WHERE code = 'CANCELLED';
