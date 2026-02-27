package com.ssg.iot.service;

import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.common.NotFoundException;
import com.ssg.iot.common.PageResponse;
import com.ssg.iot.domain.*;
import com.ssg.iot.dto.common.CategoryOptionResponse;
import com.ssg.iot.dto.iot.*;
import com.ssg.iot.dto.listing.ListingResponse;
import com.ssg.iot.repository.IotComponentRepository;
import com.ssg.iot.repository.IotPageContentRepository;
import com.ssg.iot.repository.IotSampleProductRepository;
import com.ssg.iot.repository.RefIotComponentCategoryRepository;
import com.ssg.iot.repository.RefIotSampleCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IotService {

    private static final String SEGMENT_COMPONENTS = "COMPONENTS";
    private static final String SEGMENT_SAMPLE_PRODUCTS = "SAMPLE_PRODUCTS";
    private static final String SEGMENT_SERVICES = "SERVICES";
    private static final String COMPONENT_SEPARATOR = "|";

    private final IotPageContentRepository pageContentRepository;
    private final IotComponentRepository iotComponentRepository;
    private final IotSampleProductRepository iotSampleProductRepository;
    private final RefIotComponentCategoryRepository iotComponentCategoryRepository;
    private final RefIotSampleCategoryRepository iotSampleCategoryRepository;
    private final ListingService listingService;
    private final CatalogItemService catalogItemService;

    @Transactional(readOnly = true)
    public IotOverviewResponse getOverview(String search, String categoryCode, String segment, int page, int size) {
        if (page < 0) {
            throw new BadRequestException("page must be greater than or equal to 0");
        }
        if (size <= 0) {
            throw new BadRequestException("size must be greater than 0");
        }

        if (categoryCode != null && !categoryCode.isBlank() && segment != null && !segment.isBlank()) {
            throw new BadRequestException("categoryCode and segment cannot be used together");
        }

        String resolvedCategory = resolveOverviewCategoryCode(categoryCode, segment);
        IotPageContent content = getActiveContent();
        PageResponse<ListingResponse> listingPage = listingService.getPublicListings(search, resolvedCategory, page, size);

        List<CategoryOptionResponse> options = new ArrayList<>();
        options.addAll(iotComponentCategoryRepository.findByActiveTrueOrderBySortOrderAscCodeAsc().stream()
                .map(item -> CategoryOptionResponse.builder().code(item.getCode()).label(item.getLabelVi()).build())
                .toList());
        options.addAll(iotSampleCategoryRepository.findByActiveTrueOrderBySortOrderAscCodeAsc().stream()
                .map(item -> CategoryOptionResponse.builder().code(item.getCode()).label(item.getLabelVi()).build())
                .toList());

        return IotOverviewResponse.builder()
                .heroTitle(content.getHeroTitle())
                .heroSubtitle(content.getHeroSubtitle())
                .heroImageUrl(content.getHeroImageUrl())
                .primaryCtaLabel(content.getPrimaryCtaLabel())
                .primaryCtaHref(content.getPrimaryCtaHref())
                .highlights(toHighlightResponses(content.getHighlights()))
                .categoryOptions(options)
                .listings(listingPage)
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<IotItemResponse> getComponents(String search, String categoryCode, int page, int size) {
        if (page < 0) throw new BadRequestException("page must be >= 0");
        if (size <= 0) throw new BadRequestException("size must be > 0");

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<IotComponent> spec = Specification.where((root, query, cb) -> cb.isTrue(root.get("active")));
        spec = spec.and((root, query, cb) -> cb.isNull(root.get("archivedAt")));

        if (categoryCode != null && !categoryCode.isBlank()) {
            String code = categoryCode.trim().toLowerCase(Locale.ROOT);
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("category").get("code")), code));
        }

        if (search != null && !search.isBlank()) {
            String kw = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), kw),
                    cb.like(cb.lower(root.get("description")), kw)
            ));
        }

        Page<IotComponent> pageResult = iotComponentRepository.findAll(spec, pageable);
        Map<Long, CatalogItem> catalogMap = catalogItemService.getBySourceIds(
                CatalogSourceType.IOT_COMPONENT,
                pageResult.getContent().stream().map(IotComponent::getId).toList()
        );

        return PageResponse.from(pageResult.map(component -> {
            CatalogItem catalog = catalogMap.get(component.getId());
            return IotItemResponse.builder()
                    .id(component.getId())
                    .catalogItemId(catalog != null ? catalog.getId() : null)
                    .title(component.getTitle())
                    .description(component.getDescription())
                    .category(CategoryOptionResponse.builder()
                            .code(component.getCategory().getCode())
                            .label(component.getCategory().getLabelVi())
                            .build())
                    .price(catalog != null ? catalog.getPrice() : component.getPrice())
                    .stock(catalog != null ? catalog.getStock() : component.getStock())
                    .imageUrl(catalog != null && catalog.getImageUrl() != null ? catalog.getImageUrl() : component.getImageUrl())
                    .purchasable(catalog != null && catalog.isActive() && catalog.getStock() > 0)
                    .createdAt(component.getCreatedAt())
                    .build();
        }));
    }

    @Transactional(readOnly = true)
    public PageResponse<IotItemResponse> getSampleProducts(String search, int page, int size) {
        PageResponse<IotSampleProjectResponse> sampleProjects = getSampleProjects(search, page, size);
        List<IotItemResponse> content = sampleProjects.getContent().stream()
                .map(item -> IotItemResponse.builder()
                        .id(item.getId())
                        .slug(item.getSlug())
                        .catalogItemId(item.getCatalogItemId())
                        .title(item.getTitle())
                        .description(item.getSummary() != null ? item.getSummary() : item.getDescription())
                        .category(item.getCategory())
                        .price(item.getPrice())
                        .stock(item.getStock())
                        .imageUrl(item.getImageUrl())
                        .purchasable(item.isPurchasable())
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
        spec = spec.and((root, query, cb) -> cb.isNull(root.get("archivedAt")));

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
        Map<Long, CatalogItem> catalogMap = catalogItemService.getBySourceIds(
                CatalogSourceType.IOT_SAMPLE,
                samplePage.getContent().stream().map(IotSampleProduct::getId).toList()
        );

        return PageResponse.from(samplePage.map(sample -> toSampleProjectResponse(sample, catalogMap.get(sample.getId()))));
    }

    @Transactional(readOnly = true)
    public IotSampleProjectResponse getSampleProjectBySlug(String slug) {
        String normalizedSlug = normalizeSlug(slug);
        IotSampleProduct sample = iotSampleProductRepository.findBySlugIgnoreCaseAndActiveTrue(normalizedSlug)
                .orElseThrow(() -> new NotFoundException("IoT sample project not found"));
        CatalogItem catalog = catalogItemService.findBySource(CatalogSourceType.IOT_SAMPLE, sample.getId()).orElse(null);
        return toSampleProjectResponse(sample, catalog);
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
        Map<Long, CatalogItem> catalogMap = catalogItemService.getBySourceIds(
                CatalogSourceType.IOT_SAMPLE,
                pageResult.getContent().stream().map(IotSampleProduct::getId).toList()
        );

        return PageResponse.from(pageResult.map(sample -> toSampleProjectResponse(sample, catalogMap.get(sample.getId()))));
    }

    @Transactional(readOnly = true)
    public IotSampleProjectResponse getAdminSampleProject(Long id) {
        IotSampleProduct sample = iotSampleProductRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("IoT sample project not found"));
        CatalogItem catalog = catalogItemService.findBySource(CatalogSourceType.IOT_SAMPLE, sample.getId()).orElse(null);
        return toSampleProjectResponse(sample, catalog);
    }

    @Transactional
    public IotSampleProjectResponse createAdminSampleProject(IotSampleProjectRequest request) {
        String normalizedSlug = normalizeSlug(request.getSlug());
        if (iotSampleProductRepository.existsBySlugIgnoreCase(normalizedSlug)) {
            throw new BadRequestException("Slug already exists");
        }

        RefIotSampleCategory category = getSampleCategoryOrThrow(request.getCategoryCode());
        boolean active = Boolean.TRUE.equals(request.getActive());

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
                .category(category)
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(trimToNull(request.getImageUrl()))
                .active(active)
                .archivedAt(active ? null : LocalDateTime.now())
                .build();

        IotSampleProduct savedSample = iotSampleProductRepository.save(sample);
        CatalogItem catalog = catalogItemService.syncFromIotSample(savedSample);
        return toSampleProjectResponse(savedSample, catalog);
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
        sample.setCategory(getSampleCategoryOrThrow(request.getCategoryCode()));
        sample.setPrice(request.getPrice());
        sample.setStock(request.getStock());
        sample.setImageUrl(trimToNull(request.getImageUrl()));
        sample.setActive(active);
        sample.setArchivedAt(active ? null : LocalDateTime.now());

        IotSampleProduct savedSample = iotSampleProductRepository.save(sample);
        CatalogItem catalog = catalogItemService.syncFromIotSample(savedSample);
        return toSampleProjectResponse(savedSample, catalog);
    }

    @Transactional
    public void deleteAdminSampleProject(Long id) {
        IotSampleProduct sample = iotSampleProductRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("IoT sample project not found"));

        sample.setActive(false);
        sample.setArchivedAt(LocalDateTime.now());
        iotSampleProductRepository.save(sample);
        catalogItemService.syncFromIotSample(sample);
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

    private String resolveOverviewCategoryCode(String categoryCode, String segment) {
        if (categoryCode != null && !categoryCode.isBlank()) {
            return categoryCode.trim().toUpperCase(Locale.ROOT);
        }

        if (segment == null || segment.isBlank()) {
            return null;
        }

        String normalizedSegment = segment.trim().toUpperCase(Locale.ROOT);
        if (normalizedSegment.equals(SEGMENT_COMPONENTS)) {
            return "IOT_COMPONENT";
        }
        if (normalizedSegment.equals(SEGMENT_SAMPLE_PRODUCTS)) {
            return "IOT_SAMPLE_KIT";
        }
        if (normalizedSegment.equals(SEGMENT_SERVICES)) {
            return "IOT_SERVICE";
        }

        throw new BadRequestException("Invalid IoT segment");
    }

    private RefIotSampleCategory getSampleCategoryOrThrow(String code) {
        if (code == null || code.isBlank()) {
            throw new BadRequestException("categoryCode is required");
        }

        return iotSampleCategoryRepository.findByCodeIgnoreCaseAndActiveTrue(code.trim())
                .orElseThrow(() -> new NotFoundException("IoT sample category not found"));
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

    private IotSampleProjectResponse toSampleProjectResponse(IotSampleProduct sample, CatalogItem catalog) {
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
                .category(CategoryOptionResponse.builder()
                        .code(sample.getCategory().getCode())
                        .label(sample.getCategory().getLabelVi())
                        .build())
                .catalogItemId(catalog != null ? catalog.getId() : null)
                .price(catalog != null ? catalog.getPrice() : sample.getPrice())
                .stock(catalog != null ? catalog.getStock() : sample.getStock())
                .imageUrl(catalog != null && catalog.getImageUrl() != null ? catalog.getImageUrl() : sample.getImageUrl())
                .active(sample.isActive())
                .purchasable(catalog != null && catalog.isActive() && catalog.getStock() > 0)
                .createdAt(sample.getCreatedAt())
                .updatedAt(sample.getUpdatedAt())
                .build();
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
