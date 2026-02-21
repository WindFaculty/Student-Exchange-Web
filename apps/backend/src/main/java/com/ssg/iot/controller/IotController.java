package com.ssg.iot.controller;

import com.ssg.iot.dto.iot.IotOverviewResponse;
import com.ssg.iot.service.IotService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/iot")
@RequiredArgsConstructor
public class IotController {

    private final IotService iotService;

    @GetMapping("/overview")
    public IotOverviewResponse getOverview(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String segment,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return iotService.getOverview(search, category, segment, page, size);
    }
}
