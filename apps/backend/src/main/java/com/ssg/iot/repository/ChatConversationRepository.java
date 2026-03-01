package com.ssg.iot.repository;

import com.ssg.iot.domain.ChatConversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {
    Optional<ChatConversation> findByUserAIdAndUserBId(Long userAId, Long userBId);

    Page<ChatConversation> findByUserAIdOrUserBId(Long userAId, Long userBId, Pageable pageable);

    @Query("""
            select coalesce(sum(case
                                 when c.userAId = :userId then c.userAUnreadCount
                                 else c.userBUnreadCount
                                 end), 0)
            from ChatConversation c
            where c.userAId = :userId or c.userBId = :userId
            """)
    long sumUnreadByUserId(@Param("userId") Long userId);

    @Query(value = """
            SELECT c.*
            FROM chat_conversations c
                     JOIN users ua ON ua.id = c.user_a_id
                     JOIN users ub ON ub.id = c.user_b_id
            WHERE (:keyword IS NULL OR :keyword = ''
                OR LOWER(ua.full_name) LIKE CONCAT('%', LOWER(:keyword), '%')
                OR LOWER(ub.full_name) LIKE CONCAT('%', LOWER(:keyword), '%')
                OR LOWER(ua.username) LIKE CONCAT('%', LOWER(:keyword), '%')
                OR LOWER(ub.username) LIKE CONCAT('%', LOWER(:keyword), '%')
                OR LOWER(ua.email) LIKE CONCAT('%', LOWER(:keyword), '%')
                OR LOWER(ub.email) LIKE CONCAT('%', LOWER(:keyword), '%'))
            ORDER BY c.last_message_at DESC, c.updated_at DESC
            """,
            countQuery = """
                    SELECT COUNT(*)
                    FROM chat_conversations c
                             JOIN users ua ON ua.id = c.user_a_id
                             JOIN users ub ON ub.id = c.user_b_id
                    WHERE (:keyword IS NULL OR :keyword = ''
                        OR LOWER(ua.full_name) LIKE CONCAT('%', LOWER(:keyword), '%')
                        OR LOWER(ub.full_name) LIKE CONCAT('%', LOWER(:keyword), '%')
                        OR LOWER(ua.username) LIKE CONCAT('%', LOWER(:keyword), '%')
                        OR LOWER(ub.username) LIKE CONCAT('%', LOWER(:keyword), '%')
                        OR LOWER(ua.email) LIKE CONCAT('%', LOWER(:keyword), '%')
                        OR LOWER(ub.email) LIKE CONCAT('%', LOWER(:keyword), '%'))
                    """,
            nativeQuery = true)
    Page<ChatConversation> searchForAdmin(@Param("keyword") String keyword, Pageable pageable);
}
