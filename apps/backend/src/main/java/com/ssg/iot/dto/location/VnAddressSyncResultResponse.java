package com.ssg.iot.dto.location;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class VnAddressSyncResultResponse {
    private String status;
    private String source;
    private String message;
    private LocalDateTime syncedAt;
    private int provinceCount;
    private int districtCount;
    private int wardCount;
}
