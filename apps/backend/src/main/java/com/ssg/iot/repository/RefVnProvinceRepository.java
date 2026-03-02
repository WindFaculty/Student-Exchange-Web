package com.ssg.iot.repository;

import com.ssg.iot.domain.RefVnProvince;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RefVnProvinceRepository extends JpaRepository<RefVnProvince, Long> {
    Optional<RefVnProvince> findByCodeIgnoreCaseAndActiveTrue(String code);

    @Query("""
            SELECT p
            FROM RefVnProvince p
            WHERE p.active = true
              AND (:q IS NULL
                   OR LOWER(p.nameCurrent) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(COALESCE(p.nameOld, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            ORDER BY p.nameCurrent ASC
            """)
    List<RefVnProvince> searchActive(@Param("q") String q);
}
