package com.ssg.iot.controller;

import com.ssg.iot.common.PageResponse;
import com.ssg.iot.domain.User;
import com.ssg.iot.dto.event.EventRegistrationResponse;
import com.ssg.iot.dto.listing.ListingResponse;
import com.ssg.iot.service.EventService;
import com.ssg.iot.service.ListingService;
import com.ssg.iot.service.SessionAuthService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    private final ListingService listingService;
    private final EventService eventService;
    private final SessionAuthService sessionAuthService;

    @GetMapping("/listings")
    public PageResponse<ListingResponse> getMyListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        User user = sessionAuthService.requireUser(session);
        return listingService.getMyListings(user, page, size);
    }

    @GetMapping("/event-registrations")
    public List<EventRegistrationResponse> getMyEventRegistrations(HttpSession session) {
        User user = sessionAuthService.requireUser(session);
        return eventService.getMyRegistrations(user);
    }
}
