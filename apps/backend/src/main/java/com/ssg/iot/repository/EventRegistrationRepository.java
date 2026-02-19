package com.ssg.iot.repository;

import com.ssg.iot.domain.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    List<EventRegistration> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<EventRegistration> findByEventIdOrderByCreatedAtDesc(Long eventId);
    boolean existsByEventIdAndEmailIgnoreCase(Long eventId, String email);
}
