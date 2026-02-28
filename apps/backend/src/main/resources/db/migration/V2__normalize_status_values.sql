-- Normalize legacy status values to match enum values in backend domain.
UPDATE orders
SET status = 'DELIVERED'
WHERE UPPER(status) = 'COMPLETED';

UPDATE orders
SET status = 'PENDING'
WHERE status NOT IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED');

UPDATE support_tickets
SET status = 'PENDING'
WHERE UPPER(status) = 'OPEN';

UPDATE support_tickets
SET status = 'PENDING'
WHERE status NOT IN ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

UPDATE event_registrations
SET status = 'REGISTERED'
WHERE UPPER(status) = 'PENDING';

UPDATE event_registrations
SET status = 'REGISTERED'
WHERE status NOT IN ('REGISTERED', 'CONFIRMED', 'CANCELLED');

ALTER TABLE orders
ADD CONSTRAINT ck_orders_status
CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'));

ALTER TABLE support_tickets
ADD CONSTRAINT ck_support_tickets_status
CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'));

ALTER TABLE event_registrations
ADD CONSTRAINT ck_event_registrations_status
CHECK (status IN ('REGISTERED', 'CONFIRMED', 'CANCELLED'));

