package com.ssg.iot.controller;

import com.ssg.iot.common.PageResponse;
import com.ssg.iot.domain.User;
import com.ssg.iot.dto.listing.ListingRequest;
import com.ssg.iot.dto.listing.ListingResponse;
import com.ssg.iot.service.ListingService;
import com.ssg.iot.service.SessionAuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;
    private final SessionAuthService sessionAuthService;

    @GetMapping
    public PageResponse<ListingResponse> getListings(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, name = "categoryCode") String categoryCode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return listingService.getPublicListings(search, categoryCode, page, size);
    }

    @GetMapping("/{id}")
    public ListingResponse getListing(@PathVariable Long id) {
        return listingService.getPublicListing(id);
    }

    @PostMapping
    public ListingResponse createListing(@Valid @RequestBody ListingRequest request, HttpSession session) {
        User user = sessionAuthService.requireUser(session);
        return listingService.createListing(user, request);
    }

    @PutMapping("/{id}")
    public ListingResponse updateListing(@PathVariable Long id, @Valid @RequestBody ListingRequest request, HttpSession session) {
        User user = sessionAuthService.requireUser(session);
        return listingService.updateListing(id, request, user, false);
    }

    @DeleteMapping("/{id}")
    public void deleteListing(@PathVariable Long id, HttpSession session) {
        User user = sessionAuthService.requireUser(session);
        listingService.deleteListing(id, user, false);
    }
}
