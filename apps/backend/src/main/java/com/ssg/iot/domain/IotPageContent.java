package com.ssg.iot.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "iot_page_contents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IotPageContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hero_title", nullable = false, length = 200)
    private String heroTitle;

    @Column(name = "hero_subtitle", nullable = false, length = 1000)
    private String heroSubtitle;

    @Column(name = "hero_image_url", columnDefinition = "VARCHAR(MAX)")
    private String heroImageUrl;

    @Column(name = "primary_cta_label", nullable = false, length = 120)
    private String primaryCtaLabel;

    @Column(name = "primary_cta_href", nullable = false, length = 255)
    private String primaryCtaHref;

    @Column(nullable = false)
    private boolean active = true;

    @Builder.Default
    @OneToMany(mappedBy = "pageContent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<IotHighlight> highlights = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void addHighlight(IotHighlight highlight) {
        highlights.add(highlight);
        highlight.setPageContent(this);
    }

    public void clearHighlights() {
        highlights.forEach(highlight -> highlight.setPageContent(null));
        highlights.clear();
    }
}
