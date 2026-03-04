package com.ssg.iot.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ref_vn_sync_state")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefVnSyncState {

    @Id
    private Long id;

    @Column(name = "last_status", nullable = false, length = 30)
    private String lastStatus;

    @Column(name = "last_source", length = 80)
    private String lastSource;

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    @Column(name = "last_success_at")
    private LocalDateTime lastSuccessAt;

    @Column(name = "province_count", nullable = false)
    private int provinceCount;

    @Column(name = "ward_count", nullable = false)
    private int wardCount;

    @Column(name = "last_error", length = 2000)
    private String lastError;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
