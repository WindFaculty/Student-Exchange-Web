package com.ssg.iot.dto.chat;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatSocketEventResponse {
    private String type;
    private Long conversationId;
    private ChatMessageResponse message;
    private Integer unreadCount;
}
