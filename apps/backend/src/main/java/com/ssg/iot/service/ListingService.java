package com.ssg.iot.service;

import com.ssg.iot.common.ForbiddenException;
import com.ssg.iot.common.NotFoundException;
import com.ssg.iot.common.PageResponse;
import com.ssg.iot.domain.CatalogSourceType;
import com.ssg.iot.domain.Listing;
import com.ssg.iot.domain.RefListingCategory;
import com.ssg.iot.domain.User;
import com.ssg.iot.dto.common.CategoryOptionResponse;
import com.ssg.iot.dto.listing.ListingRequest;
import com.ssg.iot.dto.listing.ListingResponse;
import com.ssg.iot.repository.ListingRepository;
import com.ssg.iot.repository.RefListingCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;
    private final RefListingCategoryRepository listingCategoryRepository;
    private final CatalogItemService catalogItemService;

    @Transactional(readOnly = true)
    public PageResponse<ListingResponse> getPublicListings(String search, String categoryCode, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<Listing> spec = Specification.where((root, query, cb) -> cb.isTrue(root.get("active")));
        spec = spec.and((root, query, cb) -> cb.isNull(root.get("archivedAt")));

        if (categoryCode != null && !categoryCode.isBlank()) {
            String code = categoryCode.trim().toLowerCase(Locale.ROOT);
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("category").get("code")), code));
        }

        if (search != null && !search.isBlank()) {
            String keyword = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
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
                .filter(item -> item.getArchivedAt() == null)
                .orElseThrow(() -> new NotFoundException("Listing not found"));
    }

    @Transactional
    public ListingResponse createListing(User owner, ListingRequest request) {
        RefListingCategory category = getCategoryOrThrow(request.getCategoryCode());

        Listing listing = Listing.builder()
                .title(request.getTitle().trim())
                .description(trimToNull(request.getDescription()))
                .category(category)
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(trimToNull(request.getImageUrl()))
                .active(true)
                .archivedAt(null)
                .owner(owner)
                .build();

        Listing saved = listingRepository.save(listing);
        catalogItemService.syncFromListing(saved);
        return toResponse(saved);
    }

    @Transactional
    public ListingResponse updateListing(Long id, ListingRequest request, User actor, boolean adminContext) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Listing not found"));

        if (!adminContext && !listing.getOwner().getId().equals(actor.getId())) {
            throw new ForbiddenException("You can only update your own listing");
        }

        listing.setTitle(request.getTitle().trim());
        listing.setDescription(trimToNull(request.getDescription()));
        listing.setCategory(getCategoryOrThrow(request.getCategoryCode()));
        listing.setPrice(request.getPrice());
        listing.setStock(request.getStock());
        listing.setImageUrl(trimToNull(request.getImageUrl()));

        Listing saved = listingRepository.save(listing);
        catalogItemService.syncFromListing(saved);
        return toResponse(saved);
    }

    @Transactional
    public void deleteListing(Long id, User actor, boolean adminContext) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Listing not found"));

        if (!adminContext && !listing.getOwner().getId().equals(actor.getId())) {
            throw new ForbiddenException("You can only delete your own listing");
        }

        listing.setActive(false);
        listing.setArchivedAt(LocalDateTime.now());
        listingRepository.save(listing);
        catalogItemService.syncFromListing(listing);
    }

    @Transactional(readOnly = true)
    public PageResponse<ListingResponse> getMyListings(User owner, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ListingResponse> responsePage = listingRepository.findByOwnerId(owner.getId(), pageable).map(this::toResponse);
        return PageResponse.from(responsePage);
    }

    @Transactional(readOnly = true)
    public PageResponse<ListingResponse> getAdminListings(String search, String categoryCode, Boolean active, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<Listing> spec = Specification.where(null);

        if (active != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("active"), active));
        }

        if (categoryCode != null && !categoryCode.isBlank()) {
            String code = categoryCode.trim().toLowerCase(Locale.ROOT);
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("category").get("code")), code));
        }

        if (search != null && !search.isBlank()) {
            String keyword = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
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
        Long catalogItemId = catalogItemService.findBySource(CatalogSourceType.LISTING, listing.getId())
                .map(item -> item.getId())
                .orElse(null);

        return ListingResponse.builder()
                .id(listing.getId())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .category(CategoryOptionResponse.builder()
                        .code(listing.getCategory().getCode())
                        .label(listing.getCategory().getLabelVi())
                        .build())
                .catalogItemId(catalogItemId)
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

    private RefListingCategory getCategoryOrThrow(String code) {
        if (code == null || code.isBlank()) {
            throw new NotFoundException("Listing category is required");
        }
        return listingCategoryRepository.findByCodeIgnoreCaseAndActiveTrue(code.trim())
                .orElseThrow(() -> new NotFoundException("Listing category not found"));
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
