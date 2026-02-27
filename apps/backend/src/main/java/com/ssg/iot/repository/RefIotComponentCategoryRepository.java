package com.ssg.iot.repository;

import com.ssg.iot.domain.RefIotComponentCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefIotComponentCategoryRepository extends JpaRepository<RefIotComponentCategory, Long> {
    Optional<RefIotComponentCategory> findByCodeIgnoreCaseAndActiveTrue(String code);
    List<RefIotComponentCategory> findByActiveTrueOrderBySortOrderAscCodeAsc();
}
