CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE listings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(2000),
    category VARCHAR(80) NOT NULL,
    price DECIMAL(19,2) NOT NULL,
    stock INT NOT NULL,
    image_url VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    owner_id BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_listing_owner FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(40) NOT NULL UNIQUE,
    customer_name VARCHAR(120) NOT NULL,
    customer_email VARCHAR(160) NOT NULL,
    customer_address VARCHAR(500) NOT NULL,
    status VARCHAR(30) NOT NULL,
    total_amount DECIMAL(19,2) NOT NULL,
    user_id BIGINT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    listing_id BIGINT NOT NULL,
    listing_title VARCHAR(200) NOT NULL,
    unit_price DECIMAL(19,2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(19,2) NOT NULL,
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_order_item_listing FOREIGN KEY (listing_id) REFERENCES listings(id)
);

CREATE TABLE events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    summary VARCHAR(600),
    description VARCHAR(4000),
    start_at DATETIME(6) NOT NULL,
    end_at DATETIME(6) NOT NULL,
    location VARCHAR(300) NOT NULL,
    type VARCHAR(60) NOT NULL,
    fee DECIMAL(19,2) NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    user_id BIGINT NULL,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    phone VARCHAR(40),
    note VARCHAR(1000),
    status VARCHAR(30) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_registration_event FOREIGN KEY (event_id) REFERENCES events(id),
    CONSTRAINT fk_registration_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT uq_registration_event_email UNIQUE (event_id, email)
);

CREATE TABLE faqs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(80) NOT NULL,
    question VARCHAR(500) NOT NULL,
    answer VARCHAR(4000) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE support_tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_code VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    subject VARCHAR(250) NOT NULL,
    category VARCHAR(80) NOT NULL,
    message VARCHAR(4000) NOT NULL,
    status VARCHAR(30) NOT NULL,
    admin_reply VARCHAR(4000),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    replied_at DATETIME(6) NULL
);

CREATE INDEX idx_listing_category ON listings(category);
CREATE INDEX idx_order_code ON orders(order_code);
CREATE INDEX idx_event_start_at ON events(start_at);
CREATE INDEX idx_ticket_code ON support_tickets(ticket_code);

INSERT INTO users (username, password, full_name, email, role, active)
VALUES
    ('admin', 'admin123', 'Platform Admin', 'admin@studentexchange.local', 'ADMIN', 1),
    ('student1', 'user123', 'Student User', 'student1@example.com', 'USER', 1);

INSERT INTO listings (title, description, category, price, stock, image_url, active, owner_id)
VALUES
    ('Arduino Basics Workshop Slot', 'One seat for Arduino hands-on weekend workshop.', 'WORKSHOP_SLOT', 250000, 12, '/products/arduino-uno.jpg', 1, 2),
    ('Embedded Systems Mentoring Session', '1:1 mentoring session for embedded systems project.', 'MENTORING', 400000, 6, '/products/esp32.jpg', 1, 2),
    ('IoT Project Starter Kit', 'Starter kit for IoT student projects with sensors and board.', 'KIT', 650000, 15, '/products/raspberry-pi-4.jpg', 1, 1),
    ('University Exchange Consultation', 'Consultation package for student exchange preparation.', 'CONSULTATION', 300000, 20, '/products/dht11.png', 1, 1);

INSERT INTO events (title, summary, description, start_at, end_at, location, type, fee, image_url, active)
VALUES
    ('Global Student Exchange Fair 2026', 'Meet partner universities and alumni.', 'A full-day event focused on exchange opportunities and scholarship guidance.', '2026-06-15T09:00:00', '2026-06-15T17:00:00', 'Ho Chi Minh City Campus', 'FAIR', 0, '/events/study-abroad-1.jpg', 1),
    ('International Internship Bootcamp', 'Prepare for overseas internships.', 'Workshops for CV review, interview preparation, and networking.', '2026-07-20T08:30:00', '2026-07-20T16:30:00', 'Online', 'BOOTCAMP', 150000, '/events/job-fair-1.webp', 1),
    ('AI and Mobility Hackathon', 'Build solutions for student mobility.', '24-hour hackathon for innovation in education and mobility.', '2026-08-10T08:00:00', '2026-08-11T10:00:00', 'Innovation Lab', 'HACKATHON', 200000, '/events/hackathon-1.png', 1);

INSERT INTO faqs (category, question, answer, display_order, active)
VALUES
    ('LISTING', 'How do I create a listing?', 'Login, open the Listings page, and submit the listing form.', 1, 1),
    ('ORDER', 'How can I track my order?', 'Use Track Order with your order code and email address.', 2, 1),
    ('EVENT', 'How do I register for an event?', 'Open event detail and submit registration form.', 3, 1),
    ('SUPPORT', 'How long does support take?', 'Most tickets are handled within 24 business hours.', 4, 1);

