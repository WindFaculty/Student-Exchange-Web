package com.ssg.iot.dto.iot;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class IotHighlightUpdateRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String icon;

    @Min(1)
    private int displayOrder;
}
