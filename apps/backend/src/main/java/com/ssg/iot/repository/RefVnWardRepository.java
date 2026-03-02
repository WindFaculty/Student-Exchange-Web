package com.ssg.iot.repository;

import com.ssg.iot.domain.RefVnWard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RefVnWardRepository extends JpaRepository<RefVnWard, Long> {
    Optional<RefVnWard> findByCodeIgnoreCaseAndActiveTrue(String code);

    @Query("""
            SELECT w
            FROM RefVnWard w
            WHERE w.active = true
              AND LOWER(w.districtCode) = LOWER(:districtCode)
              AND (:q IS NULL
                   OR LOWER(w.nameCurrent) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(COALESCE(w.nameOld, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            ORDER BY w.nameCurrent ASC
            """)
    List<RefVnWard> searchActiveByDistrictCode(@Param("districtCode") String districtCode, @Param("q") String q);
}
