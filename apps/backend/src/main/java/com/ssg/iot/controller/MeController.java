package com.ssg.iot.controller;

import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.common.PageResponse;
import com.ssg.iot.domain.User;
import com.ssg.iot.dto.auth.ChangePasswordRequest;
import com.ssg.iot.dto.auth.UpdateProfileRequest;
import com.ssg.iot.dto.auth.UserSessionResponse;
import com.ssg.iot.dto.event.EventRegistrationResponse;
import com.ssg.iot.dto.listing.ListingResponse;
import com.ssg.iot.dto.order.OrderResponse;
import com.ssg.iot.service.AuthService;
import com.ssg.iot.service.EventService;
import com.ssg.iot.service.ListingService;
import com.ssg.iot.service.OrderService;
import com.ssg.iot.service.SessionAuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    private static final int MAX_AVATAR_DATA_URL_LENGTH = 2_000_000;

    private final ListingService listingService;
    private final EventService eventService;
    private final OrderService orderService;
    private final AuthService authService;
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

    @GetMapping("/orders")
    public PageResponse<OrderResponse> getMyOrders(
            @RequestParam(defaultValue = "BOTH") String scope,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpSession session
    ) {
        User user = sessionAuthService.requireUser(session);
        return orderService.getMyOrders(user, scope, page, size);
    }

    @PutMapping("/profile")
    public UserSessionResponse updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            HttpSession session
    ) {
        User user = sessionAuthService.requireUser(session);
        return authService.updateProfile(user, request);
    }

    @PostMapping("/change-password")
    public void changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            HttpSession session
    ) {
        User user = sessionAuthService.requireUser(session);
        authService.changePassword(user, request.getCurrentPassword(), request.getNewPassword());
    }

    @PostMapping("/avatar")
    public UserSessionResponse uploadAvatar(
            @RequestBody java.util.Map<String, String> body,
            HttpSession session
    ) {
        User user = sessionAuthService.requireUser(session);
        String dataUrl = body.get("avatarUrl");
        if (dataUrl == null || !dataUrl.startsWith("data:image/")) {
            throw new BadRequestException("Invalid image data");
        }
        if (dataUrl.length() > MAX_AVATAR_DATA_URL_LENGTH) {
            throw new BadRequestException("Avatar image is too large");
        }
        return authService.updateAvatar(user, dataUrl);
    }
}
