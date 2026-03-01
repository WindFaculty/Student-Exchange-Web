package com.ssg.iot.domain;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ChatConversationTest {

    @Test
    void helperMethodsWorkForUserAAndUserB() {
        ChatConversation conversation = ChatConversation.builder()
                .userAId(10L)
                .userBId(20L)
                .userAUnreadCount(1)
                .userBUnreadCount(2)
                .build();

        assertTrue(conversation.includesUser(10L));
        assertTrue(conversation.includesUser(20L));
        assertFalse(conversation.includesUser(99L));

        assertEquals(20L, conversation.getOtherUserId(10L));
        assertEquals(10L, conversation.getOtherUserId(20L));
        assertNull(conversation.getOtherUserId(99L));

        assertEquals(1, conversation.getUnreadForUser(10L));
        assertEquals(2, conversation.getUnreadForUser(20L));
        assertEquals(0, conversation.getUnreadForUser(99L));

        conversation.incrementUnreadForUser(10L);
        conversation.incrementUnreadForUser(20L);
        assertEquals(2, conversation.getUnreadForUser(10L));
        assertEquals(3, conversation.getUnreadForUser(20L));

        conversation.setUnreadForUser(10L, 0);
        conversation.setUnreadForUser(20L, -5);
        assertEquals(0, conversation.getUnreadForUser(10L));
        assertEquals(0, conversation.getUnreadForUser(20L));
    }
}
