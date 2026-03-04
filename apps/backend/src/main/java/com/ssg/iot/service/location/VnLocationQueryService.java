package com.ssg.iot.service.location;

import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.domain.RefVnProvince;
import com.ssg.iot.domain.RefVnWard;
import com.ssg.iot.dto.location.VnLocationOptionResponse;
import com.ssg.iot.repository.RefVnProvinceRepository;
import com.ssg.iot.repository.RefVnWardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VnLocationQueryService {

    private final RefVnProvinceRepository provinceRepository;
    private final RefVnWardRepository wardRepository;

    @Transactional(readOnly = true)
    public List<VnLocationOptionResponse> getProvinces(String q) {
        return provinceRepository.searchActive(normalizeQuery(q)).stream()
                .map(item -> VnLocationOptionResponse.builder()
                        .code(item.getCode())
                        .name(item.getNameCurrent())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VnLocationOptionResponse> getWardsByProvince(String provinceCode, String q) {
        String normalizedProvinceCode = normalizeRequired(provinceCode, "provinceCode is required");
        return wardRepository.searchActiveByProvinceCode(normalizedProvinceCode, normalizeQuery(q)).stream()
                .map(item -> VnLocationOptionResponse.builder()
                        .code(item.getCode())
                        .name(item.getNameCurrent())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public RefVnProvince getProvinceOrThrow(String code) {
        String normalized = normalizeRequired(code, "provinceCode is required");
        return provinceRepository.findByCodeIgnoreCaseAndActiveTrue(normalized)
                .orElseThrow(() -> new BadRequestException("Invalid provinceCode: " + normalized));
    }

    @Transactional(readOnly = true)
    public RefVnWard getWardOrThrow(String code) {
        String normalized = normalizeRequired(code, "wardCode is required");
        return wardRepository.findByCodeIgnoreCaseAndActiveTrue(normalized)
                .orElseThrow(() -> new BadRequestException("Invalid wardCode: " + normalized));
    }

    private String normalizeRequired(String value, String errorMessage) {
        String normalized = normalizeQuery(value);
        if (normalized == null) {
            throw new BadRequestException(errorMessage);
        }
        return normalized;
    }

    private String normalizeQuery(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().replaceAll("\\s+", " ");
        return normalized.isEmpty() ? null : normalized;
    }
}
