package com.ssg.iot.service;

import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.common.NotFoundException;
import com.ssg.iot.domain.*;
import com.ssg.iot.repository.CatalogItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogItemService {

    private final CatalogItemRepository catalogItemRepository;

    @Transactional(readOnly = true)
    public CatalogItem getActiveCatalogItem(Long catalogItemId) {
        return catalogItemRepository.findByIdAndActiveTrue(catalogItemId)
                .orElseThrow(() -> new NotFoundException("Catalog item not found"));
    }

    @Transactional(readOnly = true)
    public Optional<CatalogItem> findBySource(CatalogSourceType sourceType, Long sourceRefId) {
        return catalogItemRepository.findBySourceTypeAndSourceRefId(sourceType, sourceRefId);
    }

    @Transactional(readOnly = true)
    public Map<Long, CatalogItem> getBySourceIds(CatalogSourceType sourceType, List<Long> sourceIds) {
        if (sourceIds == null || sourceIds.isEmpty()) {
            return Map.of();
        }

        return catalogItemRepository.findBySourceTypeAndSourceRefIdIn(sourceType, sourceIds)
                .stream()
                .collect(Collectors.toMap(CatalogItem::getSourceRefId, item -> item));
    }

    @Transactional
    public CatalogItem syncFromListing(Listing listing) {
        return upsertSource(
                CatalogSourceType.LISTING,
                listing.getId(),
                listing.getTitle(),
                listing.getDescription(),
                listing.getPrice(),
                listing.getStock(),
                listing.getImageUrl(),
                listing.isActive(),
                listing.getArchivedAt()
        );
    }

    @Transactional
    public CatalogItem syncFromIotComponent(IotComponent component) {
        return upsertSource(
                CatalogSourceType.IOT_COMPONENT,
                component.getId(),
                component.getTitle(),
                component.getDescription(),
                component.getPrice(),
                component.getStock(),
                component.getImageUrl(),
                component.isActive(),
                component.getArchivedAt()
        );
    }

    @Transactional
    public CatalogItem syncFromIotSample(IotSampleProduct sample) {
        return upsertSource(
                CatalogSourceType.IOT_SAMPLE,
                sample.getId(),
                sample.getTitle(),
                sample.getDescription(),
                sample.getPrice(),
                sample.getStock(),
                sample.getImageUrl(),
                sample.isActive(),
                sample.getArchivedAt()
        );
    }

    @Transactional
    public void updateStock(CatalogItem catalogItem, int nextStock) {
        if (nextStock < 0) {
            throw new BadRequestException("Stock cannot be negative");
        }
        catalogItem.setStock(nextStock);
        catalogItemRepository.save(catalogItem);
    }

    @Transactional
    public CatalogItem upsertSource(
            CatalogSourceType sourceType,
            Long sourceRefId,
            String title,
            String description,
            java.math.BigDecimal price,
            int stock,
            String imageUrl,
            boolean active,
            LocalDateTime archivedAt
    ) {
        CatalogItem item = catalogItemRepository.findBySourceTypeAndSourceRefId(sourceType, sourceRefId)
                .orElseGet(() -> CatalogItem.builder()
                        .sourceType(sourceType)
                        .sourceRefId(sourceRefId)
                        .build());

        item.setTitle(title);
        item.setDescription(description);
        item.setPrice(price);
        item.setStock(stock);
        item.setImageUrl(imageUrl);
        item.setSearchTitleNorm(normalize(title));
        item.setSearchDescNorm(normalize(description));
        item.setActive(active);
        item.setArchivedAt(active ? null : (archivedAt != null ? archivedAt : LocalDateTime.now()));
        return catalogItemRepository.save(item);
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }
}
