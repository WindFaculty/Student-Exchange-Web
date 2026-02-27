package com.ssg.iot.controller;

import com.ssg.iot.common.PageResponse;
import com.ssg.iot.dto.iot.IotItemResponse;
import com.ssg.iot.dto.iot.IotOverviewResponse;
import com.ssg.iot.dto.iot.IotSampleProjectResponse;
import com.ssg.iot.service.IotService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/iot")
@RequiredArgsConstructor
public class IotController {

    private final IotService iotService;

    /** Legacy overview endpoint — kept for backward compatibility  */
    @GetMapping("/overview")
    public IotOverviewResponse getOverview(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, name = "categoryCode") String categoryCode,
            @RequestParam(required = false) String segment,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return iotService.getOverview(search, categoryCode, segment, page, size);
    }

    /** Linh kiện — dedicated iot_components table */
    @GetMapping("/components")
    public PageResponse<IotItemResponse> getComponents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, name = "categoryCode") String categoryCode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return iotService.getComponents(search, categoryCode, page, size);
    }

    /** Sản phẩm mẫu — dedicated iot_sample_products table */
    @GetMapping("/sample-products")
    public PageResponse<IotItemResponse> getSampleProducts(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return iotService.getSampleProducts(search, page, size);
    }

    @GetMapping("/sample-projects")
    public PageResponse<IotSampleProjectResponse> getSampleProjects(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return iotService.getSampleProjects(search, page, size);
    }

    @GetMapping("/sample-projects/{slug}")
    public IotSampleProjectResponse getSampleProjectBySlug(@PathVariable String slug) {
        return iotService.getSampleProjectBySlug(slug);
    }
}
