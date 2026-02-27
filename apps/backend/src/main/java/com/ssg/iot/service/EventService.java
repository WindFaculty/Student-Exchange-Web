package com.ssg.iot.service;

import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.common.NotFoundException;
import com.ssg.iot.common.PageResponse;
import com.ssg.iot.domain.Event;
import com.ssg.iot.domain.EventRegistration;
import com.ssg.iot.domain.RefEventRegistrationStatus;
import com.ssg.iot.domain.User;
import com.ssg.iot.dto.event.EventRegistrationRequest;
import com.ssg.iot.dto.event.EventRegistrationResponse;
import com.ssg.iot.dto.event.EventRequest;
import com.ssg.iot.dto.event.EventResponse;
import com.ssg.iot.repository.EventRegistrationRepository;
import com.ssg.iot.repository.EventRepository;
import com.ssg.iot.repository.RefEventRegistrationStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final RefEventRegistrationStatusRepository registrationStatusRepository;

    @Transactional(readOnly = true)
    public PageResponse<EventResponse> getPublicEvents(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startAt"));
        Specification<Event> spec = Specification.where((root, query, cb) -> cb.isTrue(root.get("active")));

        if (search != null && !search.isBlank()) {
            String keyword = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), keyword),
                    cb.like(cb.lower(root.get("summary")), keyword),
                    cb.like(cb.lower(root.get("description")), keyword)
            ));
        }

        Page<EventResponse> mapped = eventRepository.findAll(spec, pageable).map(this::toResponse);
        return PageResponse.from(mapped);
    }

    @Transactional(readOnly = true)
    public EventResponse getPublicEvent(Long eventId) {
        Event event = eventRepository.findByIdAndActiveTrue(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found"));
        return toResponse(event);
    }

    @Transactional
    public EventResponse createEvent(EventRequest request) {
        validateEventRange(request);

        Event event = Event.builder()
                .title(request.getTitle().trim())
                .summary(request.getSummary())
                .description(request.getDescription())
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .location(request.getLocation().trim())
                .type(request.getType().trim())
                .fee(request.getFee())
                .imageUrl(request.getImageUrl())
                .active(request.getActive() == null || request.getActive())
                .build();

        return toResponse(eventRepository.save(event));
    }

    @Transactional
    public EventResponse updateEvent(Long eventId, EventRequest request) {
        validateEventRange(request);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found"));

        event.setTitle(request.getTitle().trim());
        event.setSummary(request.getSummary());
        event.setDescription(request.getDescription());
        event.setStartAt(request.getStartAt());
        event.setEndAt(request.getEndAt());
        event.setLocation(request.getLocation().trim());
        event.setType(request.getType().trim());
        event.setFee(request.getFee());
        event.setImageUrl(request.getImageUrl());
        if (request.getActive() != null) {
            event.setActive(request.getActive());
        }

        return toResponse(eventRepository.save(event));
    }

    @Transactional
    public void deleteEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found"));
        event.setActive(false);
        eventRepository.save(event);
    }

    @Transactional
    public EventRegistrationResponse registerEvent(Long eventId, EventRegistrationRequest request, User currentUser) {
        Event event = eventRepository.findByIdAndActiveTrue(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found"));

        if (registrationRepository.existsByEventIdAndEmailIgnoreCase(eventId, request.getEmail())) {
            throw new BadRequestException("Email has already registered for this event");
        }

        EventRegistration registration = EventRegistration.builder()
                .event(event)
                .user(currentUser)
                .name(request.getName().trim())
                .email(request.getEmail().trim())
                .phone(request.getPhone())
                .note(request.getNote())
                .status(getStatusOrThrow("REGISTERED"))
                .build();

        return toRegistrationResponse(registrationRepository.save(registration));
    }

    @Transactional(readOnly = true)
    public List<EventRegistrationResponse> getMyRegistrations(User currentUser) {
        return registrationRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::toRegistrationResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventRegistrationResponse> getEventRegistrations(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new NotFoundException("Event not found");
        }
        return registrationRepository.findByEventIdOrderByCreatedAtDesc(eventId)
                .stream()
                .map(this::toRegistrationResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<EventResponse> getAdminEvents(String search, Boolean active, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startAt"));
        Specification<Event> spec = Specification.where(null);

        if (active != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("active"), active));
        }

        if (search != null && !search.isBlank()) {
            String keyword = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), keyword),
                    cb.like(cb.lower(root.get("summary")), keyword),
                    cb.like(cb.lower(root.get("description")), keyword)
            ));
        }

        Page<EventResponse> mapped = eventRepository.findAll(spec, pageable).map(this::toResponse);
        return PageResponse.from(mapped);
    }

    private void validateEventRange(EventRequest request) {
        if (request.getEndAt().isBefore(request.getStartAt())) {
            throw new BadRequestException("Event end time must be after start time");
        }
    }

    private RefEventRegistrationStatus getStatusOrThrow(String code) {
        return registrationStatusRepository.findByCodeIgnoreCaseAndActiveTrue(code)
                .orElseThrow(() -> new NotFoundException("Event registration status not found: " + code));
    }

    public EventResponse toResponse(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .summary(event.getSummary())
                .description(event.getDescription())
                .startAt(event.getStartAt())
                .endAt(event.getEndAt())
                .location(event.getLocation())
                .type(event.getType())
                .fee(event.getFee())
                .imageUrl(event.getImageUrl())
                .active(event.isActive())
                .createdAt(event.getCreatedAt())
                .build();
    }

    private EventRegistrationResponse toRegistrationResponse(EventRegistration registration) {
        return EventRegistrationResponse.builder()
                .id(registration.getId())
                .eventId(registration.getEvent().getId())
                .eventTitle(registration.getEvent().getTitle())
                .name(registration.getName())
                .email(registration.getEmail())
                .phone(registration.getPhone())
                .note(registration.getNote())
                .status(registration.getStatus().getCode())
                .createdAt(registration.getCreatedAt())
                .build();
    }
}
