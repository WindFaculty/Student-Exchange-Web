package com.ssg.iot.dto.support;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateTicketStatusRequest {
    @NotBlank
    private String status;
}
