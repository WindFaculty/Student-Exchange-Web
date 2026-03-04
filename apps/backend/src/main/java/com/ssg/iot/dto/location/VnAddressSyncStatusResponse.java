package com.ssg.iot.dto.location;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class VnAddressSyncStatusResponse {
    private String lastStatus;
    private String lastSource;
    private LocalDateTime lastSyncedAt;
    private LocalDateTime lastSuccessAt;
    private int provinceCount;
    private int wardCount;
    private String lastError;
}
