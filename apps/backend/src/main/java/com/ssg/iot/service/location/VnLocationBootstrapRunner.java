package com.ssg.iot.service.location;

import com.ssg.iot.repository.RefVnWardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class VnLocationBootstrapRunner implements ApplicationRunner {

    private final RefVnWardRepository wardRepository;
    private final VnLocationSyncService locationSyncService;

    @Override
    public void run(ApplicationArguments args) {
        long wardCount = wardRepository.count();
        if (wardCount > 0) {
            return;
        }

        try {
            log.info("VN location tables are empty. Triggering bootstrap sync.");
            locationSyncService.syncNow();
        } catch (Exception ex) {
            log.error("Failed to bootstrap VN location data on startup: {}", ex.getMessage(), ex);
        }
    }
}
