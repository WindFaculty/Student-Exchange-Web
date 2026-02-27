package com.ssg.iot.dto.support;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SupportTicketResponse {
    private Long id;
    private String ticketCode;
    private String name;
    private String email;
    private String subject;
    private String category;
    private String message;
    private String status;
    private String adminReply;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime repliedAt;
}
