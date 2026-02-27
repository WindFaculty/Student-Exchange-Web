package com.ssg.iot.repository;

import com.ssg.iot.domain.SupportTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    Optional<SupportTicket> findByTicketCodeAndEmailIgnoreCase(String ticketCode, String email);
    Page<SupportTicket> findByStatus_CodeIgnoreCase(String statusCode, Pageable pageable);
}
