package com.ssg.iot.service.location.source;

import java.time.LocalDate;
import java.util.List;

public record VnLocationDataset(
        List<ProvinceRecord> provinces,
        List<WardRecord> wards
) {
    public record ProvinceRecord(
            String code,
            String nameCurrent,
            String nameOld,
            boolean isMerged,
            LocalDate effectiveDate
    ) {
    }

    public record WardRecord(
            String code,
            String provinceCode,
            String nameCurrent,
            String nameOld,
            boolean isMerged,
            LocalDate effectiveDate
    ) {
    }
}
