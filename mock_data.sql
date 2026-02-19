-- Mock Data for Student Exchange Platform
-- Usage: Run this script after V1__init_schema.sql to populate the database with more test data.

-- 1. Users
-- Passwords are 'user123' (hashed/plaintext depending on implementation, assuming plaintext based on V1)
INSERT INTO users (username, password, full_name, email, role, active) VALUES
('teacher1', 'user123', 'Ms. Lan Anh', 'lananh@university.edu.vn', 'USER', 1),
('student2', 'user123', 'Tran Minh Hieu', 'hieu.tran@student.edu.vn', 'USER', 1),
('student3', 'user123', 'Nguyen Thi Mai', 'mai.nguyen@student.edu.vn', 'USER', 1),
('student4', 'user123', 'Le Van Son', 'son.le@student.edu.vn', 'USER', 1),
('shop_owner1', 'user123', 'Tech Shop Owner', 'shop@techstore.vn', 'USER', 1),
('exchange_coordinator', 'user123', 'Global Office Coordinator', 'coordinator@university.edu.vn', 'ADMIN', 1);

-- 2. Listings
-- Assuming IDs: admin=1, student1=2, teacher1=3, student2=4, ..., shop_owner1=7
INSERT INTO listings (title, description, category, price, stock, image_url, active, owner_id) VALUES
('Raspberry Pi 4 Model B 4GB', 'Used Raspberry Pi 4, perfect for IoT projects. Includes case and power supply.', 'ELECTRONICS', 1200000, 3, '/products/raspberry-pi-4.jpg', 1, 4),
('Arduino Uno R3 Starter Kit', 'Complete starter kit with sensors, wires, and breadboard. Barely used.', 'KIT', 450000, 1, '/products/arduino-uno.jpg', 1, 4),
('ESP32 Development Board', 'NodeMCU ESP32-WROOM-32D. Brand new.', 'ELECTRONICS', 150000, 10, '/products/esp32.jpg', 1, 7),
('IELTS Preparation Book Set', 'Cambridge IELTS 14-18. clean condition.', 'BOOKS', 200000, 1, '/products/ielts-books.jpg', 1, 5),
('Scientific Calculator FX-580VN X', 'Casio calculator allowed in exam rooms.', 'STATIONERY', 350000, 2, '/products/calculator.jpg', 1, 5),
('Dormitory Essential Pack', 'Lamp, fan, and extension cord combo.', 'HOUSEHOLD', 300000, 5, '/products/dorm-kit.jpg', 1, 7),
('Linear Algebra Textbook', 'Used textbook for 1st year math.', 'BOOKS', 80000, 1, '/products/math-book.jpg', 1, 6),
('STM32F103C8T6 Blue Pill', 'ARM Cortex-M3 generic board.', 'ELECTRONICS', 60000, 20, '/products/stm32.jpg', 1, 7),
('LoRaWAN Gateway Service', 'Access to private LoRaWAN gateway for 1 semester.', 'SERVICE', 500000, 10, '/products/lora-gateway.png', 1, 3),
('3D Printing Service (PLA)', '3D printing service per gram. High quality.', 'SERVICE', 2000, 1000, '/products/3d-printer.jpg', 1, 6);

-- 3. Events
INSERT INTO events (title, summary, description, start_at, end_at, location, type, fee, image_url, active) VALUES
('Startup Weekend Education', 'Build an ed-tech startup in 54 hours.', 'Join developers, designers, and educators to build new startups.', '2026-09-15T18:00:00', '2026-09-17T21:00:00', 'Main Hall', 'HACKATHON', 100000, '/events/startup-weekend.jpg', 1),
('Cultural Exchange Night: Japan', 'Experience Japanese culture and food.', 'A night of cultural exchange with students from partner universities in Japan.', '2026-10-05T17:00:00', '2026-10-05T20:00:00', 'Student Center', 'CULTURAL', 50000, '/events/japan-night.jpg', 1),
('Career Talk: Tech Industry Trends', 'Insights from industry leaders.', 'Speakers from FPT, VNG, and Grab share current tech trends.', '2026-10-12T09:00:00', '2026-10-12T11:30:00', 'Auditorium A', 'SEMINAR', 0, '/events/career-talk.png', 1),
('Volunteer Day: Green Campus', 'Clean up the campus and plant trees.', 'Join us to make our campus greener and cleaner.', '2026-11-20T07:00:00', '2026-11-20T12:00:00', 'Campus Grounds', 'VOLUNTEER', 0, '/events/green-day.jpg', 1);

-- 4. Orders
-- Manually linking listing IDs and user IDs assuming sequence
INSERT INTO orders (order_code, customer_name, customer_email, customer_address, status, total_amount, user_id) VALUES
('ORD-2026-001', 'Tran Minh Hieu', 'hieu.tran@student.edu.vn', 'Dormitory A, Room 302', 'DELIVERED', 1200000, 4),
('ORD-2026-002', 'Nguyen Thi Mai', 'mai.nguyen@student.edu.vn', '123 Le Loi, Dist 1', 'PENDING', 450000, 5),
('ORD-2026-003', 'Le Van Son', 'son.le@student.edu.vn', '456 Nguyen Hue, Dist 1', 'SHIPPING', 150000, 6);

-- Order Items (Assuming listing IDs from V1 (1-4) plus new ones (5-14))
-- Order 1: Raspberry Pi 4 (ID 5)
INSERT INTO order_items (order_id, listing_id, listing_title, unit_price, quantity, subtotal) VALUES
(1, 5, 'Raspberry Pi 4 Model B 4GB', 1200000, 1, 1200000);

-- Order 2: Arduino Kit (ID 6)
INSERT INTO order_items (order_id, listing_id, listing_title, unit_price, quantity, subtotal) VALUES
(2, 6, 'Arduino Uno R3 Starter Kit', 450000, 1, 450000);

-- Order 3: ESP32 (ID 7)
INSERT INTO order_items (order_id, listing_id, listing_title, unit_price, quantity, subtotal) VALUES
(3, 7, 'ESP32 Development Board', 150000, 1, 150000);

-- 5. Support Tickets
INSERT INTO support_tickets (ticket_code, name, email, subject, category, message, status, admin_reply, replied_at) VALUES
('TKT-001', 'Tran Minh Hieu', 'hieu.tran@student.edu.vn', 'Problem with order payment', 'ORDER', 'I cannot pay with my credit card. It shows error 500.', 'RESOLVED', 'We have fixed the gateway issue. Please try again.', '2026-03-01T10:00:00'),
('TKT-002', 'Le Van Son', 'son.le@student.edu.vn', 'Question about exchange program', 'GENERAL', 'Is the exchange program open for first year students?', 'PENDING', NULL, NULL);

-- 6. Event Registrations
INSERT INTO event_registrations (event_id, user_id, name, email, phone, note, status) VALUES
(1, 4, 'Tran Minh Hieu', 'hieu.tran@student.edu.vn', '0901234567', 'Interested in internship', 'CONFIRMED'),
(1, 5, 'Nguyen Thi Mai', 'mai.nguyen@student.edu.vn', '0909876543', NULL, 'REGISTERED');
