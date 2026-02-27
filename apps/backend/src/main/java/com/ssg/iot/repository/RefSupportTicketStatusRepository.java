package com.ssg.iot.repository;

import com.ssg.iot.domain.RefSupportTicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefSupportTicketStatusRepository extends JpaRepository<RefSupportTicketStatus, Long> {
    Optional<RefSupportTicketStatus> findByCodeIgnoreCaseAndActiveTrue(String code);
}
