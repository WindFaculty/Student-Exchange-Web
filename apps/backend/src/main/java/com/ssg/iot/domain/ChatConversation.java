package com.ssg.iot.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_a_id", nullable = false)
    private Long userAId;

    @Column(name = "user_b_id", nullable = false)
    private Long userBId;

    @Column(name = "user_a_unread_count", nullable = false)
    private int userAUnreadCount;

    @Column(name = "user_b_unread_count", nullable = false)
    private int userBUnreadCount;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public boolean includesUser(Long userId) {
        return userAId.equals(userId) || userBId.equals(userId);
    }

    public Long getOtherUserId(Long userId) {
        if (userAId.equals(userId)) {
            return userBId;
        }
        if (userBId.equals(userId)) {
            return userAId;
        }
        return null;
    }

    public int getUnreadForUser(Long userId) {
        if (userAId.equals(userId)) {
            return userAUnreadCount;
        }
        if (userBId.equals(userId)) {
            return userBUnreadCount;
        }
        return 0;
    }

    public void setUnreadForUser(Long userId, int count) {
        int normalizedCount = Math.max(count, 0);
        if (userAId.equals(userId)) {
            userAUnreadCount = normalizedCount;
            return;
        }
        if (userBId.equals(userId)) {
            userBUnreadCount = normalizedCount;
        }
    }

    public void incrementUnreadForUser(Long userId) {
        if (userAId.equals(userId)) {
            userAUnreadCount += 1;
            return;
        }
        if (userBId.equals(userId)) {
            userBUnreadCount += 1;
        }
    }
}
