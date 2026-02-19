package com.ssg.iot.dto.event;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class EventRequest {
    @NotBlank
    private String title;

    private String summary;
    private String description;

    @NotNull
    private LocalDateTime startAt;

    @NotNull
    private LocalDateTime endAt;

    @NotBlank
    private String location;

    @NotBlank
    private String type;

    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal fee;

    private String imageUrl;

    private Boolean active;
}
