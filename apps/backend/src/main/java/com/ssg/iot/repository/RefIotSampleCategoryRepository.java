package com.ssg.iot.repository;

import com.ssg.iot.domain.RefIotSampleCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefIotSampleCategoryRepository extends JpaRepository<RefIotSampleCategory, Long> {
    Optional<RefIotSampleCategory> findByCodeIgnoreCaseAndActiveTrue(String code);
    List<RefIotSampleCategory> findByActiveTrueOrderBySortOrderAscCodeAsc();
}
