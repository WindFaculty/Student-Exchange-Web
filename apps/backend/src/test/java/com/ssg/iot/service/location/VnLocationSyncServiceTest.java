package com.ssg.iot.service.location;

import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.common.ConflictException;
import com.ssg.iot.domain.RefVnSyncState;
import com.ssg.iot.dto.location.VnAddressSyncResultResponse;
import com.ssg.iot.repository.RefVnProvinceRepository;
import com.ssg.iot.repository.RefVnSyncStateRepository;
import com.ssg.iot.repository.RefVnWardRepository;
import com.ssg.iot.service.location.source.VnLocationDataset;
import com.ssg.iot.service.location.source.VnLocationSourceAdapter;
import com.ssg.iot.service.location.source.VnLocationSourceLoadResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.SimpleTransactionStatus;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class VnLocationSyncServiceTest {

    private RefVnProvinceRepository provinceRepository;
    private RefVnWardRepository wardRepository;
    private RefVnSyncStateRepository syncStateRepository;
    private RefVnSyncState syncState;

    @BeforeEach
    void setUp() {
        provinceRepository = mock(RefVnProvinceRepository.class);
        wardRepository = mock(RefVnWardRepository.class);
        syncStateRepository = mock(RefVnSyncStateRepository.class);

        syncState = RefVnSyncState.builder()
                .id(1L)
                .lastStatus("IDLE")
                .provinceCount(0)
                .wardCount(0)
                .build();

        when(syncStateRepository.findById(1L)).thenReturn(Optional.of(syncState));
        when(syncStateRepository.save(any(RefVnSyncState.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(provinceRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(wardRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void syncNowPublishesDatasetWhenOfficialSourceIsValid() {
        VnLocationSourceAdapter officialAdapter = mock(VnLocationSourceAdapter.class);
        when(officialAdapter.sourceTag()).thenReturn("OFFICIAL");
        when(officialAdapter.load()).thenReturn(VnLocationSourceLoadResult.success("OFFICIAL", buildConformantDataset()));

        VnLocationSyncService service = newService(List.of(officialAdapter));
        VnAddressSyncResultResponse result = service.syncNow();

        assertEquals("SUCCESS", result.getStatus());
        assertEquals("OFFICIAL", result.getSource());
        assertEquals(1, result.getProvinceCount());
        assertEquals(1, result.getWardCount());

        verify(provinceRepository).deleteAllInBatch();
        verify(wardRepository).deleteAllInBatch();
        verify(provinceRepository).saveAll(any());
        verify(wardRepository).saveAll(any());
    }

    @Test
    void syncNowFailsClosedWhenNoSourcePassesValidation() {
        VnLocationSourceAdapter officialAdapter = mock(VnLocationSourceAdapter.class);
        when(officialAdapter.sourceTag()).thenReturn("OFFICIAL");
        when(officialAdapter.load()).thenReturn(VnLocationSourceLoadResult.failure("OFFICIAL", "timeout"));

        VnLocationSourceAdapter fallbackAdapter = mock(VnLocationSourceAdapter.class);
        when(fallbackAdapter.sourceTag()).thenReturn("FALLBACK_OPEN_API");
        when(fallbackAdapter.load()).thenReturn(VnLocationSourceLoadResult.success("FALLBACK_OPEN_API", buildNonConformantDataset()));

        VnLocationSyncService service = newService(List.of(officialAdapter, fallbackAdapter));

        assertThrows(BadRequestException.class, service::syncNow);
        verify(provinceRepository, never()).saveAll(any());
        verify(wardRepository, never()).saveAll(any());
    }

    @Test
    void syncNowRejectsConcurrentSyncRequests() throws Exception {
        CountDownLatch adapterStarted = new CountDownLatch(1);
        CountDownLatch adapterContinue = new CountDownLatch(1);

        VnLocationSourceAdapter blockingAdapter = new VnLocationSourceAdapter() {
            @Override
            public String sourceTag() {
                return "OFFICIAL";
            }

            @Override
            public VnLocationSourceLoadResult load() {
                adapterStarted.countDown();
                try {
                    adapterContinue.await(2, TimeUnit.SECONDS);
                } catch (InterruptedException ignored) {
                    Thread.currentThread().interrupt();
                }
                return VnLocationSourceLoadResult.success("OFFICIAL", buildConformantDataset());
            }
        };

        VnLocationSyncService service = newService(List.of(blockingAdapter));
        var executor = Executors.newSingleThreadExecutor();
        Future<VnAddressSyncResultResponse> firstCall = executor.submit(service::syncNow);

        assertTrue(adapterStarted.await(2, TimeUnit.SECONDS));
        assertThrows(ConflictException.class, service::syncNow);

        adapterContinue.countDown();
        VnAddressSyncResultResponse firstResult = firstCall.get(3, TimeUnit.SECONDS);
        assertEquals("SUCCESS", firstResult.getStatus());
        executor.shutdownNow();
    }

    private VnLocationSyncService newService(List<VnLocationSourceAdapter> adapters) {
        TransactionTemplate transactionTemplate = new TransactionTemplate(new NoOpTransactionManager());

        return new VnLocationSyncService(
                provinceRepository,
                wardRepository,
                syncStateRepository,
                adapters,
                transactionTemplate
        );
    }

    private static class NoOpTransactionManager implements PlatformTransactionManager {
        @Override
        public TransactionStatus getTransaction(TransactionDefinition definition) {
            return new SimpleTransactionStatus();
        }

        @Override
        public void commit(TransactionStatus status) {
            // no-op for unit test
        }

        @Override
        public void rollback(TransactionStatus status) {
            // no-op for unit test
        }
    }

    private VnLocationDataset buildConformantDataset() {
        LocalDate effectiveDate = LocalDate.of(2025, 7, 1);
        return new VnLocationDataset(
                List.of(new VnLocationDataset.ProvinceRecord("79", "Ho Chi Minh", null, true, effectiveDate)),
                List.of(new VnLocationDataset.WardRecord("79001001", "79", "Linh Tay", null, true, effectiveDate))
        );
    }

    private VnLocationDataset buildNonConformantDataset() {
        return new VnLocationDataset(
                List.of(new VnLocationDataset.ProvinceRecord("79", "Ho Chi Minh", null, false, null)),
                List.of(new VnLocationDataset.WardRecord("79001001", "99", "Linh Tay", null, false, null))
        );
    }
}
