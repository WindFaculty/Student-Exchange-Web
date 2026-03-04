package com.ssg.iot.service.location;

import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.common.ConflictException;
import com.ssg.iot.domain.RefVnProvince;
import com.ssg.iot.domain.RefVnSyncState;
import com.ssg.iot.domain.RefVnWard;
import com.ssg.iot.dto.location.VnAddressSyncResultResponse;
import com.ssg.iot.dto.location.VnAddressSyncStatusResponse;
import com.ssg.iot.repository.RefVnProvinceRepository;
import com.ssg.iot.repository.RefVnSyncStateRepository;
import com.ssg.iot.repository.RefVnWardRepository;
import com.ssg.iot.service.location.source.VnLocationDataset;
import com.ssg.iot.service.location.source.VnLocationSourceAdapter;
import com.ssg.iot.service.location.source.VnLocationSourceLoadResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VnLocationSyncService {

    private static final Long SYNC_STATE_ID = 1L;
    private static final String STATUS_IDLE = "IDLE";
    private static final String STATUS_SYNCING = "SYNCING";
    private static final String STATUS_SUCCESS = "SUCCESS";
    private static final String STATUS_FAILED = "FAILED";
    private static final int MAX_ERROR_LENGTH = 1800;

    private final RefVnProvinceRepository provinceRepository;
    private final RefVnWardRepository wardRepository;
    private final RefVnSyncStateRepository syncStateRepository;
    private final List<VnLocationSourceAdapter> sourceAdapters;
    private final TransactionTemplate transactionTemplate;

    private final ReentrantLock syncLock = new ReentrantLock();

    @Transactional(readOnly = true)
    public VnAddressSyncStatusResponse getSyncStatus() {
        return toStatusResponse(getOrCreateState());
    }

    public VnAddressSyncResultResponse syncNow() {
        if (!syncLock.tryLock()) {
            throw new ConflictException("VN location sync is already running");
        }
        try {
            LocalDateTime syncStartedAt = LocalDateTime.now();
            markSyncing(syncStartedAt);

            List<String> errors = new ArrayList<>();
            for (VnLocationSourceAdapter adapter : sourceAdapters) {
                VnLocationSourceLoadResult loadResult = adapter.load();
                if (!loadResult.isSuccess()) {
                    errors.add(adapter.sourceTag() + ": " + loadResult.error());
                    continue;
                }

                VnLocationDataset normalized = normalizeDataset(loadResult.dataset());
                List<String> validationErrors = validateDataset(normalized);
                if (!validationErrors.isEmpty()) {
                    errors.add(adapter.sourceTag() + ": " + String.join("; ", validationErrors));
                    continue;
                }

                publishDataset(normalized, adapter.sourceTag(), syncStartedAt);
                return VnAddressSyncResultResponse.builder()
                        .status(STATUS_SUCCESS)
                        .source(adapter.sourceTag())
                        .message("Synced successfully")
                        .syncedAt(syncStartedAt)
                        .provinceCount(normalized.provinces().size())
                        .wardCount(normalized.wards().size())
                        .build();
            }

            String joinedError = joinErrors(errors);
            markFailed(syncStartedAt, joinedError);
            throw new BadRequestException("VN location sync failed: " + joinedError);
        } finally {
            syncLock.unlock();
        }
    }

    private VnAddressSyncStatusResponse toStatusResponse(RefVnSyncState state) {
        return VnAddressSyncStatusResponse.builder()
                .lastStatus(state.getLastStatus())
                .lastSource(state.getLastSource())
                .lastSyncedAt(state.getLastSyncedAt())
                .lastSuccessAt(state.getLastSuccessAt())
                .provinceCount(state.getProvinceCount())
                .wardCount(state.getWardCount())
                .lastError(state.getLastError())
                .build();
    }

    private RefVnSyncState getOrCreateState() {
        return syncStateRepository.findById(SYNC_STATE_ID)
                .orElseGet(() -> syncStateRepository.save(RefVnSyncState.builder()
                        .id(SYNC_STATE_ID)
                        .lastStatus(STATUS_IDLE)
                        .provinceCount(0)
                        .wardCount(0)
                        .build()));
    }

    private void markSyncing(LocalDateTime syncedAt) {
        RefVnSyncState state = getOrCreateState();
        state.setLastStatus(STATUS_SYNCING);
        state.setLastSyncedAt(syncedAt);
        state.setLastError(null);
        syncStateRepository.save(state);
    }

    private void markFailed(LocalDateTime syncedAt, String error) {
        RefVnSyncState state = getOrCreateState();
        state.setLastStatus(STATUS_FAILED);
        state.setLastSyncedAt(syncedAt);
        state.setLastError(truncateError(error));
        syncStateRepository.save(state);
    }

    private void publishDataset(VnLocationDataset dataset, String sourceTag, LocalDateTime syncedAt) {
        transactionTemplate.executeWithoutResult(status -> {
            wardRepository.deleteAllInBatch();
            provinceRepository.deleteAllInBatch();

            List<RefVnProvince> provinces = dataset.provinces().stream()
                    .map(item -> RefVnProvince.builder()
                            .code(item.code())
                            .nameCurrent(item.nameCurrent())
                            .nameOld(item.nameOld())
                            .isMerged(item.isMerged())
                            .effectiveDate(item.effectiveDate())
                            .sourceTag(sourceTag)
                            .active(true)
                            .build())
                    .toList();
            provinceRepository.saveAll(provinces);

            List<RefVnWard> wards = dataset.wards().stream()
                    .map(item -> RefVnWard.builder()
                            .code(item.code())
                            .provinceCode(item.provinceCode())
                            .nameCurrent(item.nameCurrent())
                            .nameOld(item.nameOld())
                            .isMerged(item.isMerged())
                            .effectiveDate(item.effectiveDate())
                            .sourceTag(sourceTag)
                            .active(true)
                            .build())
                    .toList();
            wardRepository.saveAll(wards);

            RefVnSyncState state = getOrCreateState();
            state.setLastStatus(STATUS_SUCCESS);
            state.setLastSource(sourceTag);
            state.setLastSyncedAt(syncedAt);
            state.setLastSuccessAt(syncedAt);
            state.setProvinceCount(dataset.provinces().size());
            state.setWardCount(dataset.wards().size());
            state.setLastError(null);
            syncStateRepository.save(state);
        });
    }

    private VnLocationDataset normalizeDataset(VnLocationDataset dataset) {
        Map<String, VnLocationDataset.ProvinceRecord> provincesByCode = new LinkedHashMap<>();
        for (VnLocationDataset.ProvinceRecord item : dataset.provinces()) {
            String code = normalize(item.code());
            String nameCurrent = normalize(item.nameCurrent());
            if (code == null || nameCurrent == null) {
                continue;
            }
            provincesByCode.put(code, new VnLocationDataset.ProvinceRecord(
                    code,
                    nameCurrent,
                    normalize(item.nameOld()),
                    item.isMerged(),
                    item.effectiveDate()
            ));
        }

        Map<String, VnLocationDataset.WardRecord> wardsByCode = new LinkedHashMap<>();
        for (VnLocationDataset.WardRecord item : dataset.wards()) {
            String code = normalize(item.code());
            String provinceCode = normalize(item.provinceCode());
            String nameCurrent = normalize(item.nameCurrent());
            if (code == null || provinceCode == null || nameCurrent == null) {
                continue;
            }
            wardsByCode.put(code, new VnLocationDataset.WardRecord(
                    code,
                    provinceCode,
                    nameCurrent,
                    normalize(item.nameOld()),
                    item.isMerged(),
                    item.effectiveDate()
            ));
        }

        return new VnLocationDataset(
                new ArrayList<>(provincesByCode.values()),
                new ArrayList<>(wardsByCode.values())
        );
    }

    private List<String> validateDataset(VnLocationDataset dataset) {
        List<String> errors = new ArrayList<>();
        if (dataset.provinces().isEmpty()) {
            errors.add("province dataset is empty");
        }
        if (dataset.wards().isEmpty()) {
            errors.add("ward dataset is empty");
        }
        if (!errors.isEmpty()) {
            return errors;
        }

        Set<String> provinceCodes = dataset.provinces().stream()
                .map(VnLocationDataset.ProvinceRecord::code)
                .collect(Collectors.toSet());
        for (VnLocationDataset.WardRecord ward : dataset.wards()) {
            if (!provinceCodes.contains(ward.provinceCode())) {
                errors.add("ward " + ward.code() + " references missing province " + ward.provinceCode());
            }
        }
        return errors;
    }

    private String joinErrors(List<String> errors) {
        if (errors == null || errors.isEmpty()) {
            return "unknown sync error";
        }
        String joined = String.join(" | ", errors);
        return truncateError(joined);
    }

    private String truncateError(String value) {
        String normalized = normalize(value);
        if (normalized == null) {
            return null;
        }
        if (normalized.length() <= MAX_ERROR_LENGTH) {
            return normalized;
        }
        return normalized.substring(0, MAX_ERROR_LENGTH);
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().replaceAll("\\s+", " ");
        return normalized.isEmpty() ? null : normalized;
    }
}
