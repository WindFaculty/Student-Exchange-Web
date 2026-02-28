package com.ssg.iot.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "iot_sample_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IotSampleProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 120, unique = true)
    private String slug;

    @Column(length = 1200)
    private String summary;

    @Column(length = 2000)
    private String description;

    @Column(length = 2000)
    private String mainComponents;

    @Column(length = 40)
    private String difficulty;

    @Column(length = 80)
    private String buildTime;

    @Column(length = 120)
    private String mcuSoc;

    @Column(length = 120)
    private String connectivity;

    @Column(length = 255)
    private String projectPath;

    @Column(length = 255)
    private String readmePath;

    @Column(length = 255)
    private String pinoutPath;

    @Column(length = 255)
    private String principlePath;

    @Column(length = 255)
    private String sourcesPath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private RefIotSampleCategory category;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private int stock;

    @Lob
    private String imageUrl;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "archived_at")
    private LocalDateTime archivedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
