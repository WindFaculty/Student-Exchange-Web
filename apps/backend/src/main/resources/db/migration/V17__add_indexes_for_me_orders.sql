CREATE INDEX idx_orders_user_created
ON orders(user_id, created_at DESC);

CREATE INDEX idx_orders_email_guest_created
ON orders(customer_email, user_id, created_at DESC);
