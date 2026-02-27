package com.ssg.iot.repository;

import com.ssg.iot.domain.RefOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefOrderStatusRepository extends JpaRepository<RefOrderStatus, Long> {
    Optional<RefOrderStatus> findByCodeIgnoreCaseAndActiveTrue(String code);
}
