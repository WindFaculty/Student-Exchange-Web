package com.ssg.iot.repository;

import com.ssg.iot.domain.Listing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface ListingRepository extends JpaRepository<Listing, Long>, JpaSpecificationExecutor<Listing> {
    Optional<Listing> findByIdAndActiveTrue(Long id);
    List<Listing> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    Page<Listing> findByOwnerId(Long ownerId, Pageable pageable);
}
