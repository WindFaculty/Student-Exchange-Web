package com.ssg.iot.service;

import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.common.NotFoundException;
import com.ssg.iot.common.PageResponse;
import com.ssg.iot.domain.IotComponent;
import com.ssg.iot.domain.IotHighlight;
import com.ssg.iot.domain.IotPageContent;
import com.ssg.iot.domain.IotSampleProduct;
import com.ssg.iot.domain.Listing;
import com.ssg.iot.domain.User;
import com.ssg.iot.domain.UserRole;
import com.ssg.iot.dto.iot.IotContentResponse;
import com.ssg.iot.dto.iot.IotContentUpdateRequest;
import com.ssg.iot.dto.iot.IotHighlightResponse;
import com.ssg.iot.dto.iot.IotHighlightUpdateRequest;
import com.ssg.iot.dto.iot.IotItemResponse;
import com.ssg.iot.dto.iot.IotOverviewResponse;
import com.ssg.iot.dto.iot.IotSampleProjectRequest;
import com.ssg.iot.dto.iot.IotSampleProjectResponse;
import com.ssg.iot.dto.listing.ListingResponse;
import com.ssg.iot.repository.IotComponentRepository;
import com.ssg.iot.repository.IotPageContentRepository;
import com.ssg.iot.repository.IotSampleProductRepository;
import com.ssg.iot.repository.ListingRepository;
import com.ssg.iot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

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
    private static final String COMPONENT_SEPARATOR = "|";

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
    private final IotComponentRepository iotComponentRepository;
    private final IotSampleProductRepository iotSampleProductRepository;
    private final UserRepository userRepository;

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
    public PageResponse<IotItemResponse> getComponents(String search, String category, int page, int size) {
        if (page < 0) throw new BadRequestException("page must be >= 0");
        if (size <= 0) throw new BadRequestException("size must be > 0");

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<IotComponent> spec = Specification.where(
                (root, query, cb) -> cb.isTrue(root.get("active")));

        if (category != null && !category.isBlank()) {
            String cat = category.trim().toLowerCase(Locale.ROOT);
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("category")), "%" + cat + "%"));
        }

        if (search != null && !search.isBlank()) {
            String kw = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), kw),
                    cb.like(cb.lower(root.get("description")), kw)
            ));
        }

        return PageResponse.from(iotComponentRepository.findAll(spec, pageable)
                .map(c -> IotItemResponse.builder()
                        .id(c.getId())
                        .listingId(c.getId())
                        .title(c.getTitle())
                        .description(c.getDescription())
                        .category(c.getCategory())
                        .price(c.getPrice())
                        .stock(c.getStock())
                        .imageUrl(c.getImageUrl())
                        .listingActive(true)
                        .createdAt(c.getCreatedAt())
                        .build()));
    }

    @Transactional(readOnly = true)
    public PageResponse<IotItemResponse> getSampleProducts(String search, int page, int size) {
        PageResponse<IotSampleProjectResponse> sampleProjects = getSampleProjects(search, page, size);
        List<IotItemResponse> content = sampleProjects.getContent().stream()
                .map(item -> IotItemResponse.builder()
                        .id(item.getListingId() != null ? item.getListingId() : item.getId())
                        .slug(item.getSlug())
                        .listingId(item.getListingId())
                        .title(item.getTitle())
                        .description(item.getSummary() != null ? item.getSummary() : item.getDescription())
                        .price(item.getPrice())
                        .stock(item.getStock())
                        .imageUrl(item.getImageUrl())
                        .listingActive(item.isListingActive())
                        .createdAt(item.getCreatedAt())
                        .build())
                .toList();

        return new PageResponse<>(
                content,
                sampleProjects.getTotalElements(),
                sampleProjects.getTotalPages(),
                sampleProjects.getCurrentPage(),
                sampleProjects.getPageSize()
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<IotSampleProjectResponse> getSampleProjects(String search, int page, int size) {
        if (page < 0) throw new BadRequestException("page must be >= 0");
        if (size <= 0) throw new BadRequestException("size must be > 0");

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<IotSampleProduct> spec = Specification.where((root, query, cb) -> cb.isTrue(root.get("active")));

        if (search != null && !search.isBlank()) {
            String kw = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), kw),
                    cb.like(cb.lower(root.get("slug")), kw),
                    cb.like(cb.lower(root.get("summary")), kw),
                    cb.like(cb.lower(root.get("description")), kw)
            ));
        }

        Page<IotSampleProduct> samplePage = iotSampleProductRepository.findAll(spec, pageable);
        Map<Long, Listing> listingMap = getListingMap(samplePage.getContent());
        return PageResponse.from(samplePage.map(item -> toSampleProjectResponse(item, listingMap.get(item.getListingId()))));
    }

    @Transactional(readOnly = true)
    public IotSampleProjectResponse getSampleProjectBySlug(String slug) {
        String normalizedSlug = normalizeSlug(slug);
        IotSampleProduct sample = iotSampleProductRepository.findBySlugIgnoreCaseAndActiveTrue(normalizedSlug)
                .orElseThrow(() -> new NotFoundException("IoT sample project not found"));
        Listing listing = getListingById(sample.getListingId());
        return toSampleProjectResponse(sample, listing);
    }

    @Transactional(readOnly = true)
    public PageResponse<IotSampleProjectResponse> getAdminSampleProjects(String search, Boolean active, int page, int size) {
        if (page < 0) throw new BadRequestException("page must be >= 0");
        if (size <= 0) throw new BadRequestException("size must be > 0");

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<IotSampleProduct> spec = Specification.where(null);

        if (active != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("active"), active));
        }

        if (search != null && !search.isBlank()) {
            String kw = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), kw),
                    cb.like(cb.lower(root.get("slug")), kw),
                    cb.like(cb.lower(root.get("summary")), kw),
                    cb.like(cb.lower(root.get("description")), kw)
            ));
        }

        Page<IotSampleProduct> pageResult = iotSampleProductRepository.findAll(spec, pageable);
        Map<Long, Listing> listingMap = getListingMap(pageResult.getContent());
        return PageResponse.from(pageResult.map(item -> toSampleProjectResponse(item, listingMap.get(item.getListingId()))));
    }

    @Transactional(readOnly = true)
    public IotSampleProjectResponse getAdminSampleProject(Long id) {
        IotSampleProduct sample = iotSampleProductRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("IoT sample project not found"));
        Listing listing = getListingById(sample.getListingId());
        return toSampleProjectResponse(sample, listing);
    }

    @Transactional
    public IotSampleProjectResponse createAdminSampleProject(IotSampleProjectRequest request) {
        String normalizedSlug = normalizeSlug(request.getSlug());
        if (iotSampleProductRepository.existsBySlugIgnoreCase(normalizedSlug)) {
            throw new BadRequestException("Slug already exists");
        }

        boolean active = Boolean.TRUE.equals(request.getActive());
        Listing listing = Listing.builder()
                .title(request.getTitle().trim())
                .description(trimToNull(request.getDescription()))
                .category(CATEGORY_SAMPLE_KIT)
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(trimToNull(request.getImageUrl()))
                .active(active)
                .owner(getAdminOwner())
                .build();
        Listing savedListing = listingRepository.save(listing);

        IotSampleProduct sample = IotSampleProduct.builder()
                .title(request.getTitle().trim())
                .slug(normalizedSlug)
                .summary(trimToNull(request.getSummary()))
                .description(trimToNull(request.getDescription()))
                .mainComponents(joinMainComponents(request.getMainComponents()))
                .difficulty(trimToNull(request.getDifficulty()))
                .buildTime(trimToNull(request.getBuildTime()))
                .mcuSoc(trimToNull(request.getMcuSoc()))
                .connectivity(trimToNull(request.getConnectivity()))
                .projectPath(request.getProjectPath().trim())
                .readmePath(request.getReadmePath().trim())
                .pinoutPath(request.getPinoutPath().trim())
                .principlePath(request.getPrinciplePath().trim())
                .sourcesPath(request.getSourcesPath().trim())
                .listingId(savedListing.getId())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(trimToNull(request.getImageUrl()))
                .active(active)
                .build();
        IotSampleProduct savedSample = iotSampleProductRepository.save(sample);
        return toSampleProjectResponse(savedSample, savedListing);
    }

    @Transactional
    public IotSampleProjectResponse updateAdminSampleProject(Long id, IotSampleProjectRequest request) {
        IotSampleProduct sample = iotSampleProductRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("IoT sample project not found"));

        String normalizedSlug = normalizeSlug(request.getSlug());
        if (iotSampleProductRepository.existsBySlugIgnoreCaseAndIdNot(normalizedSlug, id)) {
            throw new BadRequestException("Slug already exists");
        }

        boolean active = Boolean.TRUE.equals(request.getActive());

        Listing listing = getListingById(sample.getListingId());
        if (listing == null) {
            listing = Listing.builder()
                    .owner(getAdminOwner())
                    .category(CATEGORY_SAMPLE_KIT)
                    .build();
        }

        listing.setTitle(request.getTitle().trim());
        listing.setDescription(trimToNull(request.getDescription()));
        listing.setCategory(CATEGORY_SAMPLE_KIT);
        listing.setPrice(request.getPrice());
        listing.setStock(request.getStock());
        listing.setImageUrl(trimToNull(request.getImageUrl()));
        listing.setActive(active);
        Listing savedListing = listingRepository.save(listing);

        sample.setTitle(request.getTitle().trim());
        sample.setSlug(normalizedSlug);
        sample.setSummary(trimToNull(request.getSummary()));
        sample.setDescription(trimToNull(request.getDescription()));
        sample.setMainComponents(joinMainComponents(request.getMainComponents()));
        sample.setDifficulty(trimToNull(request.getDifficulty()));
        sample.setBuildTime(trimToNull(request.getBuildTime()));
        sample.setMcuSoc(trimToNull(request.getMcuSoc()));
        sample.setConnectivity(trimToNull(request.getConnectivity()));
        sample.setProjectPath(request.getProjectPath().trim());
        sample.setReadmePath(request.getReadmePath().trim());
        sample.setPinoutPath(request.getPinoutPath().trim());
        sample.setPrinciplePath(request.getPrinciplePath().trim());
        sample.setSourcesPath(request.getSourcesPath().trim());
        sample.setListingId(savedListing.getId());
        sample.setPrice(request.getPrice());
        sample.setStock(request.getStock());
        sample.setImageUrl(trimToNull(request.getImageUrl()));
        sample.setActive(active);

        IotSampleProduct savedSample = iotSampleProductRepository.save(sample);
        return toSampleProjectResponse(savedSample, savedListing);
    }

    @Transactional
    public void deleteAdminSampleProject(Long id) {
        IotSampleProduct sample = iotSampleProductRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("IoT sample project not found"));

        sample.setActive(false);
        iotSampleProductRepository.save(sample);

        Listing listing = getListingById(sample.getListingId());
        if (listing != null) {
            listing.setActive(false);
            listingRepository.save(listing);
        }
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

    private IotSampleProjectResponse toSampleProjectResponse(IotSampleProduct sample, Listing listing) {
        return IotSampleProjectResponse.builder()
                .id(sample.getId())
                .slug(sample.getSlug())
                .title(sample.getTitle())
                .summary(sample.getSummary())
                .description(sample.getDescription())
                .mainComponents(splitMainComponents(sample.getMainComponents()))
                .difficulty(sample.getDifficulty())
                .buildTime(sample.getBuildTime())
                .mcuSoc(sample.getMcuSoc())
                .connectivity(sample.getConnectivity())
                .projectPath(sample.getProjectPath())
                .readmePath(sample.getReadmePath())
                .pinoutPath(sample.getPinoutPath())
                .principlePath(sample.getPrinciplePath())
                .sourcesPath(sample.getSourcesPath())
                .listingId(sample.getListingId())
                .price(listing != null ? listing.getPrice() : sample.getPrice())
                .stock(listing != null ? listing.getStock() : sample.getStock())
                .imageUrl(listing != null && listing.getImageUrl() != null ? listing.getImageUrl() : sample.getImageUrl())
                .active(sample.isActive())
                .listingActive(listing != null && listing.isActive())
                .createdAt(sample.getCreatedAt())
                .updatedAt(sample.getUpdatedAt())
                .build();
    }

    private Map<Long, Listing> getListingMap(List<IotSampleProduct> samples) {
        Set<Long> listingIds = samples.stream()
                .map(IotSampleProduct::getListingId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (listingIds.isEmpty()) {
            return Map.of();
        }

        Map<Long, Listing> map = new HashMap<>();
        for (Listing listing : listingRepository.findAllById(listingIds)) {
            map.put(listing.getId(), listing);
        }
        return map;
    }

    private Listing getListingById(Long listingId) {
        if (listingId == null) {
            return null;
        }
        return listingRepository.findById(listingId).orElse(null);
    }

    private User getAdminOwner() {
        return userRepository.findFirstByRoleAndActiveTrueOrderByIdAsc(UserRole.ADMIN)
                .orElseThrow(() -> new NotFoundException("Admin account not found"));
    }

    private String normalizeSlug(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new BadRequestException("slug is required");
        }

        String normalized = slug.trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9_\\-]+", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-+", "")
                .replaceAll("-+$", "");

        if (normalized.isBlank()) {
            throw new BadRequestException("Invalid slug");
        }

        return normalized;
    }

    private String joinMainComponents(List<String> components) {
        if (components == null || components.isEmpty()) {
            throw new BadRequestException("mainComponents must not be empty");
        }

        String joined = components.stream()
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .collect(Collectors.joining(COMPONENT_SEPARATOR));

        if (joined.isBlank()) {
            throw new BadRequestException("mainComponents must not be empty");
        }

        return joined;
    }

    private List<String> splitMainComponents(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return List.of();
        }

        return Arrays.stream(rawValue.split("\\|"))
                .map(String::trim)
                .filter(item -> !item.isBlank())
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
