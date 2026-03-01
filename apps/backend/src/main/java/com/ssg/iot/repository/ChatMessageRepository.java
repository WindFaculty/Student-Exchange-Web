package com.ssg.iot.repository;

import com.ssg.iot.domain.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    Page<ChatMessage> findByConversationId(Long conversationId, Pageable pageable);

    Optional<ChatMessage> findFirstByConversationIdOrderByIdDesc(Long conversationId);
}
