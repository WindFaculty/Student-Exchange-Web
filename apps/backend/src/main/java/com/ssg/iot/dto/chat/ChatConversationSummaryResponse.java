package com.ssg.iot.dto.chat;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatConversationSummaryResponse {
    private Long id;
    private Long userAId;
    private String userAName;
    private Long userBId;
    private String userBName;
    private String lastMessagePreview;
    private LocalDateTime lastMessageAt;
    private int unreadCount;
    private LocalDateTime updatedAt;
}
