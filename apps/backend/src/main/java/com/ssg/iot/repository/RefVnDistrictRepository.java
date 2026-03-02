package com.ssg.iot.repository;

import com.ssg.iot.domain.RefVnDistrict;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RefVnDistrictRepository extends JpaRepository<RefVnDistrict, Long> {
    Optional<RefVnDistrict> findByCodeIgnoreCaseAndActiveTrue(String code);

    @Query("""
            SELECT d
            FROM RefVnDistrict d
            WHERE d.active = true
              AND LOWER(d.provinceCode) = LOWER(:provinceCode)
              AND (:q IS NULL
                   OR LOWER(d.nameCurrent) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(COALESCE(d.nameOld, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            ORDER BY d.nameCurrent ASC
            """)
    List<RefVnDistrict> searchActiveByProvinceCode(@Param("provinceCode") String provinceCode, @Param("q") String q);
}
