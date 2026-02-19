package com.ssg.iot.service;

import com.ssg.iot.common.ForbiddenException;
import com.ssg.iot.common.NotFoundException;
import com.ssg.iot.common.PageResponse;
import com.ssg.iot.domain.Listing;
import com.ssg.iot.domain.User;
import com.ssg.iot.dto.listing.ListingRequest;
import com.ssg.iot.dto.listing.ListingResponse;
import com.ssg.iot.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;

    @Transactional(readOnly = true)
    public PageResponse<ListingResponse> getPublicListings(String search, String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<Listing> spec = Specification.where((root, query, cb) -> cb.isTrue(root.get("active")));

        if (category != null && !category.isBlank()) {
            String categoryValue = category.trim().toLowerCase();
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("category")), categoryValue));
        }

        if (search != null && !search.isBlank()) {
            String keyword = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), keyword),
                    cb.like(cb.lower(root.get("description")), keyword)
            ));
        }

        Page<ListingResponse> responsePage = listingRepository.findAll(spec, pageable).map(this::toResponse);
        return PageResponse.from(responsePage);
    }

    @Transactional(readOnly = true)
    public ListingResponse getPublicListing(Long id) {
        return toResponse(getActiveListingEntity(id));
    }

    @Transactional(readOnly = true)
    public Listing getActiveListingEntity(Long id) {
        return listingRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new NotFoundException("Listing not found"));
    }

    @Transactional
    public ListingResponse createListing(User owner, ListingRequest request) {
        Listing listing = Listing.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .category(request.getCategory().trim())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .active(true)
                .owner(owner)
                .build();
        return toResponse(listingRepository.save(listing));
    }

    @Transactional
    public ListingResponse updateListing(Long id, ListingRequest request, User actor, boolean adminContext) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Listing not found"));

        if (!adminContext && !listing.getOwner().getId().equals(actor.getId())) {
            throw new ForbiddenException("You can only update your own listing");
        }

        listing.setTitle(request.getTitle().trim());
        listing.setDescription(request.getDescription());
        listing.setCategory(request.getCategory().trim());
        listing.setPrice(request.getPrice());
        listing.setStock(request.getStock());
        listing.setImageUrl(request.getImageUrl());

        return toResponse(listingRepository.save(listing));
    }

    @Transactional
    public void deleteListing(Long id, User actor, boolean adminContext) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Listing not found"));

        if (!adminContext && !listing.getOwner().getId().equals(actor.getId())) {
            throw new ForbiddenException("You can only delete your own listing");
        }

        listing.setActive(false);
        listingRepository.save(listing);
    }

    @Transactional(readOnly = true)
    public PageResponse<ListingResponse> getMyListings(User owner, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ListingResponse> responsePage = listingRepository.findByOwnerId(owner.getId(), pageable).map(this::toResponse);
        return PageResponse.from(responsePage);
    }

    @Transactional(readOnly = true)
    public PageResponse<ListingResponse> getAdminListings(String search, String category, Boolean active, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<Listing> spec = Specification.where(null);

        if (active != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("active"), active));
        }

        if (category != null && !category.isBlank()) {
            String categoryValue = category.trim().toLowerCase();
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("category")), categoryValue));
        }

        if (search != null && !search.isBlank()) {
            String keyword = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), keyword),
                    cb.like(cb.lower(root.get("description")), keyword)
            ));
        }

        Page<ListingResponse> responsePage = listingRepository.findAll(spec, pageable).map(this::toResponse);
        return PageResponse.from(responsePage);
    }

    @Transactional(readOnly = true)
    public ListingResponse getAdminListing(Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Listing not found"));
        return toResponse(listing);
    }

    public ListingResponse toResponse(Listing listing) {
        return ListingResponse.builder()
                .id(listing.getId())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .category(listing.getCategory())
                .price(listing.getPrice())
                .stock(listing.getStock())
                .imageUrl(listing.getImageUrl())
                .active(listing.isActive())
                .ownerId(listing.getOwner().getId())
                .ownerName(listing.getOwner().getFullName())
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .build();
    }
}
