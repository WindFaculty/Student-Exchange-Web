package com.ssg.iot.repository;

import com.ssg.iot.domain.RefListingCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefListingCategoryRepository extends JpaRepository<RefListingCategory, Long> {
    Optional<RefListingCategory> findByCodeIgnoreCaseAndActiveTrue(String code);
    List<RefListingCategory> findByActiveTrueOrderBySortOrderAscCodeAsc();
}
