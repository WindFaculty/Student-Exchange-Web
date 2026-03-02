package com.ssg.iot.dto.location;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VnLocationOptionResponse {
    private String code;
    private String name;
}
