package com.ssg.iot.repository;

import com.ssg.iot.domain.RefEventRegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefEventRegistrationStatusRepository extends JpaRepository<RefEventRegistrationStatus, Long> {
    Optional<RefEventRegistrationStatus> findByCodeIgnoreCaseAndActiveTrue(String code);
}
