package com.ssg.iot.dto.iot;

import com.ssg.iot.common.PageResponse;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class IotComponentPageResponse {
    private PageResponse<IotItemResponse> content;
}
