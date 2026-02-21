package com.ssg.iot.repository;

import com.ssg.iot.domain.IotPageContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IotPageContentRepository extends JpaRepository<IotPageContent, Long> {
    Optional<IotPageContent> findFirstByActiveTrueOrderByIdAsc();
}
