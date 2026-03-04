package com.ssg.iot.controller;

import com.ssg.iot.dto.location.VnLocationOptionResponse;
import com.ssg.iot.service.location.VnLocationQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/locations/vn")
@RequiredArgsConstructor
public class LocationController {

    private final VnLocationQueryService locationQueryService;

    @GetMapping("/provinces")
    public List<VnLocationOptionResponse> getProvinces(@RequestParam(required = false) String q) {
        return locationQueryService.getProvinces(q);
    }

    @GetMapping("/wards")
    public List<VnLocationOptionResponse> getWards(
            @RequestParam String provinceCode,
            @RequestParam(required = false) String q
    ) {
        return locationQueryService.getWardsByProvince(provinceCode, q);
    }
}
