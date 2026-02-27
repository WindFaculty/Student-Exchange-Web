package com.ssg.iot.dto.common;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryOptionResponse {
    private String code;
    private String label;
}
