package com.ssg.iot.controller;

import com.ssg.iot.domain.User;
import com.ssg.iot.dto.event.EventRegistrationRequest;
import com.ssg.iot.dto.event.EventRegistrationResponse;
import com.ssg.iot.dto.event.EventResponse;
import com.ssg.iot.common.PageResponse;
import com.ssg.iot.service.EventService;
import com.ssg.iot.service.SessionAuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final SessionAuthService sessionAuthService;

    @GetMapping
    public PageResponse<EventResponse> getEvents(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return eventService.getPublicEvents(search, page, size);
    }

    @GetMapping("/{id}")
    public EventResponse getEvent(@PathVariable Long id) {
        return eventService.getPublicEvent(id);
    }

    @PostMapping("/{id}/registrations")
    public EventRegistrationResponse registerEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRegistrationRequest request,
            HttpSession session
    ) {
        User currentUser = sessionAuthService.getCurrentUser(session).orElse(null);
        return eventService.registerEvent(id, request, currentUser);
    }
}
