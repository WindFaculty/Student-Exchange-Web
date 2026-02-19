package com.ssg.iot.dto.event;

import com.ssg.iot.domain.EventRegistrationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EventRegistrationResponse {
    private Long id;
    private Long eventId;
    private String eventTitle;
    private String name;
    private String email;
    private String phone;
    private String note;
    private EventRegistrationStatus status;
    private LocalDateTime createdAt;
}
