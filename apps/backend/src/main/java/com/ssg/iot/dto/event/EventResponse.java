package com.ssg.iot.dto.event;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class EventResponse {
    private Long id;
    private String title;
    private String summary;
    private String description;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private String location;
    private String type;
    private BigDecimal fee;
    private String imageUrl;
    private boolean active;
    private LocalDateTime createdAt;
}
