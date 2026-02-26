package com.ssg.iot.repository;

import com.ssg.iot.domain.IotSampleProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IotSampleProductRepository extends JpaRepository<IotSampleProduct, Long>, JpaSpecificationExecutor<IotSampleProduct> {
    Optional<IotSampleProduct> findBySlugIgnoreCaseAndActiveTrue(String slug);
    boolean existsBySlugIgnoreCase(String slug);
    boolean existsBySlugIgnoreCaseAndIdNot(String slug, Long id);
}
