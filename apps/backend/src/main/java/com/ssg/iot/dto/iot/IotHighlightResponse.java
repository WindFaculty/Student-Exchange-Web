package com.ssg.iot.dto.iot;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class IotHighlightResponse {
    private Long id;
    private String title;
    private String description;
    private String icon;
    private int displayOrder;
}
