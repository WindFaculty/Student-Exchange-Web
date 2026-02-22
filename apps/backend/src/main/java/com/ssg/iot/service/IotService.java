package com.ssg.iot.service;

import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.common.NotFoundException;
import com.ssg.iot.common.PageResponse;
import com.ssg.iot.domain.IotHighlight;
import com.ssg.iot.domain.IotPageContent;
import com.ssg.iot.domain.Listing;
import com.ssg.iot.dto.iot.*;
import com.ssg.iot.dto.listing.ListingResponse;
import com.ssg.iot.repository.IotPageContentRepository;
import com.ssg.iot.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class IotService {

    private static final String SEGMENT_COMPONENTS = "COMPONENTS";
    private static final String SEGMENT_SAMPLE_PRODUCTS = "SAMPLE_PRODUCTS";
    private static final String SEGMENT_SERVICES = "SERVICES";

    private static final String CATEGORY_CONTROLLER_BOARDS = "Board vi dieu khien / Module phat trien";
    private static final String CATEGORY_SENSORS = "Cam bien";
    private static final String CATEGORY_ACTUATORS = "Thiet bi thuc thi / Output";
    private static final String CATEGORY_CONNECTIVITY = "Module giao tiep / Ket noi";
    private static final String CATEGORY_BASIC_PARTS = "Linh kien ho tro co ban";
    private static final String CATEGORY_SAMPLE_KIT = "San pham mau / Bo KIT";
    private static final String CATEGORY_IOT_SERVICE = "Dich vu IoT";

    private static final List<String> CATEGORY_OPTIONS = List.of(
            CATEGORY_CONTROLLER_BOARDS,
            CATEGORY_SENSORS,
            CATEGORY_ACTUATORS,
            CATEGORY_CONNECTIVITY,
            CATEGORY_BASIC_PARTS,
            CATEGORY_SAMPLE_KIT,
            CATEGORY_IOT_SERVICE
    );

    private static final List<String> LEGACY_ALIAS_CATEGORIES = List.of(
            "COMPONENT",
            "ELECTRONICS",
            "SAMPLE_KIT",
            "KIT",
            "IOT_SERVICE",
            "MENTORING",
            "CONSULTATION",
            "SERVICE"
    );

    private static final List<String> DEFAULT_CATEGORY_FILTERS = new ArrayList<>();
    private static final Map<String, List<String>> SEGMENT_TO_CATEGORIES = Map.of(
            SEGMENT_COMPONENTS, List.of(
                    CATEGORY_CONTROLLER_BOARDS,
                    CATEGORY_SENSORS,
                    CATEGORY_ACTUATORS,
                    CATEGORY_CONNECTIVITY,
                    CATEGORY_BASIC_PARTS,
                    "COMPONENT",
                    "ELECTRONICS"
            ),
            SEGMENT_SAMPLE_PRODUCTS, List.of(CATEGORY_SAMPLE_KIT, "SAMPLE_KIT", "KIT"),
            SEGMENT_SERVICES, List.of(CATEGORY_IOT_SERVICE, "IOT_SERVICE", "MENTORING", "CONSULTATION", "SERVICE")
    );

    private static final Set<String> ALLOWED_CATEGORIES = new HashSet<>();
    static {
        DEFAULT_CATEGORY_FILTERS.addAll(CATEGORY_OPTIONS);
        DEFAULT_CATEGORY_FILTERS.addAll(LEGACY_ALIAS_CATEGORIES);
        CATEGORY_OPTIONS.stream()
                .map(item -> item.toUpperCase(Locale.ROOT))
                .forEach(ALLOWED_CATEGORIES::add);
        LEGACY_ALIAS_CATEGORIES.stream()
                .map(item -> item.toUpperCase(Locale.ROOT))
                .forEach(ALLOWED_CATEGORIES::add);
    }
    private static final Set<String> ALLOWED_SEGMENTS = SEGMENT_TO_CATEGORIES.keySet();

    private final IotPageContentRepository pageContentRepository;
    private final ListingRepository listingRepository;
    private final ListingService listingService;

    @Transactional(readOnly = true)
    public IotOverviewResponse getOverview(String search, String category, String segment, int page, int size) {
        if (page < 0) {
            throw new BadRequestException("page must be greater than or equal to 0");
        }
        if (size <= 0) {
            throw new BadRequestException("size must be greater than 0");
        }
        if (category != null && !category.isBlank() && segment != null && !segment.isBlank()) {
            throw new BadRequestException("category and segment cannot be used together");
        }

        String normalizedCategory = normalizeCategory(category);
        String normalizedSegment = normalizeSegment(segment);
        List<String> categoryFilters = resolveCategoryFilters(normalizedCategory, normalizedSegment);
        List<String> categoryFiltersLowerCase = categoryFilters.stream()
                .map(item -> item.toLowerCase(Locale.ROOT))
                .toList();

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<Listing> spec = Specification.where((root, query, cb) -> cb.isTrue(root.get("active")));
        spec = spec.and((root, query, cb) -> cb.lower(root.get("category")).in(categoryFiltersLowerCase));

        if (search != null && !search.isBlank()) {
            String keyword = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), keyword),
                    cb.like(cb.lower(root.get("description")), keyword)
            ));
        }

        Page<ListingResponse> listingPage = listingRepository.findAll(spec, pageable).map(listingService::toResponse);
        IotPageContent content = getActiveContent();

        return IotOverviewResponse.builder()
                .heroTitle(content.getHeroTitle())
                .heroSubtitle(content.getHeroSubtitle())
                .heroImageUrl(content.getHeroImageUrl())
                .primaryCtaLabel(content.getPrimaryCtaLabel())
                .primaryCtaHref(content.getPrimaryCtaHref())
                .highlights(toHighlightResponses(content.getHighlights()))
                .categoryOptions(CATEGORY_OPTIONS)
                .listings(PageResponse.from(listingPage))
                .build();
    }

    @Transactional(readOnly = true)
    public IotContentResponse getAdminContent() {
        return toContentResponse(getActiveContent());
    }

    @Transactional
    public IotContentResponse updateAdminContent(IotContentUpdateRequest request) {
        validateHighlights(request.getHighlights());

        IotPageContent content = getActiveContent();
        content.setHeroTitle(request.getHeroTitle().trim());
        content.setHeroSubtitle(request.getHeroSubtitle().trim());
        content.setHeroImageUrl(trimToNull(request.getHeroImageUrl()));
        content.setPrimaryCtaLabel(request.getPrimaryCtaLabel().trim());
        content.setPrimaryCtaHref(request.getPrimaryCtaHref().trim());

        content.clearHighlights();
        pageContentRepository.saveAndFlush(content);

        request.getHighlights()
                .stream()
                .sorted(Comparator.comparingInt(IotHighlightUpdateRequest::getDisplayOrder))
                .forEach(item -> content.addHighlight(IotHighlight.builder()
                        .title(item.getTitle().trim())
                        .description(item.getDescription().trim())
                        .icon(item.getIcon().trim())
                        .displayOrder(item.getDisplayOrder())
                        .active(true)
                        .build()));

        IotPageContent saved = pageContentRepository.save(content);
        return toContentResponse(saved);
    }

    private void validateHighlights(List<IotHighlightUpdateRequest> highlights) {
        if (highlights == null) {
            throw new BadRequestException("highlights must be provided");
        }
        if (highlights.size() > 6) {
            throw new BadRequestException("highlights can contain at most 6 items");
        }

        Set<Integer> displayOrders = new HashSet<>();
        for (IotHighlightUpdateRequest item : highlights) {
            if (!displayOrders.add(item.getDisplayOrder())) {
                throw new BadRequestException("displayOrder must be unique");
            }
        }
    }

    private String normalizeCategory(String category) {
        if (category == null || category.isBlank()) {
            return null;
        }
        String normalized = category.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_CATEGORIES.contains(normalized)) {
            throw new BadRequestException("Invalid IoT category");
        }
        return normalized;
    }

    private String normalizeSegment(String segment) {
        if (segment == null || segment.isBlank()) {
            return null;
        }
        String normalized = segment.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_SEGMENTS.contains(normalized)) {
            throw new BadRequestException("Invalid IoT segment");
        }
        return normalized;
    }

    private List<String> resolveCategoryFilters(String category, String segment) {
        if (category != null) {
            return List.of(category);
        }
        if (segment != null) {
            return SEGMENT_TO_CATEGORIES.get(segment);
        }
        return DEFAULT_CATEGORY_FILTERS;
    }

    private IotPageContent getActiveContent() {
        return pageContentRepository.findFirstByActiveTrueOrderByIdAsc()
                .orElseThrow(() -> new NotFoundException("IoT page content not found"));
    }

    private IotContentResponse toContentResponse(IotPageContent content) {
        return IotContentResponse.builder()
                .id(content.getId())
                .heroTitle(content.getHeroTitle())
                .heroSubtitle(content.getHeroSubtitle())
                .heroImageUrl(content.getHeroImageUrl())
                .primaryCtaLabel(content.getPrimaryCtaLabel())
                .primaryCtaHref(content.getPrimaryCtaHref())
                .highlights(toHighlightResponses(content.getHighlights()))
                .build();
    }

    private List<IotHighlightResponse> toHighlightResponses(List<IotHighlight> highlights) {
        return highlights.stream()
                .filter(IotHighlight::isActive)
                .sorted(Comparator.comparingInt(IotHighlight::getDisplayOrder))
                .map(item -> IotHighlightResponse.builder()
                        .id(item.getId())
                        .title(item.getTitle())
                        .description(item.getDescription())
                        .icon(item.getIcon())
                        .displayOrder(item.getDisplayOrder())
                        .build())
                .toList();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
