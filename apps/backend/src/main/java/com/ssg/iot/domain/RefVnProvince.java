package com.ssg.iot.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ref_vn_provinces")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefVnProvince {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String code;

    @Column(name = "name_current", nullable = false, length = 255)
    private String nameCurrent;

    @Column(name = "name_old", length = 255)
    private String nameOld;

    @Column(name = "is_merged", nullable = false)
    private boolean isMerged = false;

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Column(name = "source_tag", nullable = false, length = 60)
    private String sourceTag;

    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
