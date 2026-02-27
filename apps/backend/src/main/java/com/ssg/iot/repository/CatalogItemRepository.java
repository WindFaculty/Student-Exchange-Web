package com.ssg.iot.repository;

import com.ssg.iot.domain.CatalogItem;
import com.ssg.iot.domain.CatalogSourceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CatalogItemRepository extends JpaRepository<CatalogItem, Long> {
    Optional<CatalogItem> findByIdAndActiveTrue(Long id);
    Optional<CatalogItem> findBySourceTypeAndSourceRefId(CatalogSourceType sourceType, Long sourceRefId);
    List<CatalogItem> findBySourceTypeAndSourceRefIdIn(CatalogSourceType sourceType, List<Long> sourceRefIds);
}
