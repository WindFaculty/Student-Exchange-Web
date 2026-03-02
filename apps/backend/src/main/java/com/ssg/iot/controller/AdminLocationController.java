package com.ssg.iot.controller;

import com.ssg.iot.dto.location.VnAddressSyncResultResponse;
import com.ssg.iot.dto.location.VnAddressSyncStatusResponse;
import com.ssg.iot.service.SessionAuthService;
import com.ssg.iot.service.location.VnLocationSyncService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/locations/vn")
@RequiredArgsConstructor
public class AdminLocationController {

    private final SessionAuthService sessionAuthService;
    private final VnLocationSyncService locationSyncService;

    @GetMapping("/sync-status")
    public VnAddressSyncStatusResponse getSyncStatus(HttpSession session) {
        sessionAuthService.requireAdmin(session);
        return locationSyncService.getSyncStatus();
    }

    @PostMapping("/sync")
    public VnAddressSyncResultResponse syncNow(HttpSession session) {
        sessionAuthService.requireAdmin(session);
        return locationSyncService.syncNow();
    }
}
