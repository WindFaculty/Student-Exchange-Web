-- Create P2P chat conversations between users.
CREATE TABLE chat_conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_a_id BIGINT NOT NULL,
    user_b_id BIGINT NOT NULL,
    user_a_unread_count INT NOT NULL DEFAULT 0,
    user_b_unread_count INT NOT NULL DEFAULT 0,
    last_message_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT ck_chat_conversation_user_pair CHECK (user_a_id < user_b_id),
    CONSTRAINT ck_chat_conversation_unread_non_negative CHECK (user_a_unread_count >= 0 AND user_b_unread_count >= 0),
    CONSTRAINT fk_chat_conversation_user_a FOREIGN KEY (user_a_id) REFERENCES users(id),
    CONSTRAINT fk_chat_conversation_user_b FOREIGN KEY (user_b_id) REFERENCES users(id),
    CONSTRAINT uq_chat_conversation_user_pair UNIQUE (user_a_id, user_b_id)
);

-- Store chat messages for each conversation.
CREATE TABLE chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content VARCHAR(4000) NOT NULL,
    auto_generated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_chat_message_conversation FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_message_sender FOREIGN KEY (sender_id) REFERENCES users(id)
);

CREATE INDEX idx_chat_conversations_last_message ON chat_conversations(last_message_at, updated_at);
CREATE INDEX idx_chat_messages_conversation_id_id ON chat_messages(conversation_id, id);

-- Remove legacy listing items from order history and catalog to split listing from checkout flow.
DELETE oi
FROM order_items oi
         INNER JOIN catalog_items ci ON ci.id = oi.catalog_item_id
WHERE ci.source_type = 'LISTING';

DELETE o
FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE oi.id IS NULL;

DELETE
FROM catalog_items
WHERE source_type = 'LISTING';
