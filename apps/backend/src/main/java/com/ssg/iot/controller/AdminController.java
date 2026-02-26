package com.ssg.iot.controller;

import com.ssg.iot.common.PageResponse;
import com.ssg.iot.dto.event.EventRegistrationResponse;
import com.ssg.iot.dto.event.EventRequest;
import com.ssg.iot.dto.event.EventResponse;
import com.ssg.iot.dto.iot.IotContentResponse;
import com.ssg.iot.dto.iot.IotContentUpdateRequest;
import com.ssg.iot.dto.iot.IotSampleProjectRequest;
import com.ssg.iot.dto.iot.IotSampleProjectResponse;
import com.ssg.iot.dto.listing.ListingRequest;
import com.ssg.iot.dto.listing.ListingResponse;
import com.ssg.iot.dto.order.OrderResponse;
import com.ssg.iot.dto.order.UpdateOrderStatusRequest;
import com.ssg.iot.dto.support.ReplyTicketRequest;
import com.ssg.iot.dto.support.SupportTicketResponse;
import com.ssg.iot.dto.support.UpdateTicketStatusRequest;
import com.ssg.iot.service.*;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final SessionAuthService sessionAuthService;
    private final ListingService listingService;
    private final OrderService orderService;
    private final EventService eventService;
    private final SupportService supportService;
    private final IotService iotService;

    @GetMapping("/listings")
    public PageResponse<ListingResponse> getListings(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        sessionAuthService.requireAdmin(session);
        return listingService.getAdminListings(search, category, active, page, size);
    }

    @PostMapping("/listings")
    public ListingResponse createListing(@Valid @RequestBody ListingRequest request, HttpSession session) {
        var admin = sessionAuthService.requireAdmin(session);
        return listingService.createListing(admin, request);
    }

    @GetMapping("/listings/{id}")
    public ListingResponse getListing(@PathVariable Long id, HttpSession session) {
        sessionAuthService.requireAdmin(session);
        return listingService.getAdminListing(id);
    }

    @PutMapping("/listings/{id}")
    public ListingResponse updateListing(@PathVariable Long id, @Valid @RequestBody ListingRequest request, HttpSession session) {
        var admin = sessionAuthService.requireAdmin(session);
        return listingService.updateListing(id, request, admin, true);
    }

    @DeleteMapping("/listings/{id}")
    public void deleteListing(@PathVariable Long id, HttpSession session) {
        var admin = sessionAuthService.requireAdmin(session);
        listingService.deleteListing(id, admin, true);
    }

    @GetMapping("/orders")
    public PageResponse<OrderResponse> getOrders(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        sessionAuthService.requireAdmin(session);
        return orderService.getAdminOrders(status, page, size);
    }

    @PutMapping("/orders/{id}/status")
    public OrderResponse updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            HttpSession session
    ) {
        sessionAuthService.requireAdmin(session);
        return orderService.updateOrderStatus(id, request.getStatus());
    }

    @GetMapping("/events")
    public PageResponse<EventResponse> getEvents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        sessionAuthService.requireAdmin(session);
        return eventService.getAdminEvents(search, active, page, size);
    }

    @PostMapping("/events")
    public EventResponse createEvent(@Valid @RequestBody EventRequest request, HttpSession session) {
        sessionAuthService.requireAdmin(session);
        return eventService.createEvent(request);
    }

    @PutMapping("/events/{id}")
    public EventResponse updateEvent(@PathVariable Long id, @Valid @RequestBody EventRequest request, HttpSession session) {
        sessionAuthService.requireAdmin(session);
        return eventService.updateEvent(id, request);
    }

    @DeleteMapping("/events/{id}")
    public void deleteEvent(@PathVariable Long id, HttpSession session) {
        sessionAuthService.requireAdmin(session);
        eventService.deleteEvent(id);
    }

    @GetMapping("/events/{id}/registrations")
    public List<EventRegistrationResponse> getEventRegistrations(@PathVariable Long id, HttpSession session) {
        sessionAuthService.requireAdmin(session);
        return eventService.getEventRegistrations(id);
    }

    @GetMapping("/support/tickets")
    public PageResponse<SupportTicketResponse> getSupportTickets(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        sessionAuthService.requireAdmin(session);
        return supportService.getAdminTickets(status, page, size);
    }

    @PutMapping("/support/tickets/{id}/status")
    public SupportTicketResponse updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusRequest request,
            HttpSession session
    ) {
        sessionAuthService.requireAdmin(session);
        return supportService.updateStatus(id, request.getStatus());
    }

    @PostMapping("/support/tickets/{id}/reply")
    public SupportTicketResponse replyTicket(
            @PathVariable Long id,
            @Valid @RequestBody ReplyTicketRequest request,
            HttpSession session
    ) {
        sessionAuthService.requireAdmin(session);
        return supportService.reply(id, request.getReply());
    }

    @GetMapping("/iot/content")
    public IotContentResponse getIotContent(HttpSession session) {
        sessionAuthService.requireAdmin(session);
        return iotService.getAdminContent();
    }

    @PutMapping("/iot/content")
    public IotContentResponse updateIotContent(
            @Valid @RequestBody IotContentUpdateRequest request,
            HttpSession session
    ) {
        sessionAuthService.requireAdmin(session);
        return iotService.updateAdminContent(request);
    }

    @GetMapping("/iot/sample-projects")
    public PageResponse<IotSampleProjectResponse> getIotSampleProjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        sessionAuthService.requireAdmin(session);
        return iotService.getAdminSampleProjects(search, active, page, size);
    }

    @GetMapping("/iot/sample-projects/{id}")
    public IotSampleProjectResponse getIotSampleProject(
            @PathVariable Long id,
            HttpSession session
    ) {
        sessionAuthService.requireAdmin(session);
        return iotService.getAdminSampleProject(id);
    }

    @PostMapping("/iot/sample-projects")
    public IotSampleProjectResponse createIotSampleProject(
            @Valid @RequestBody IotSampleProjectRequest request,
            HttpSession session
    ) {
        sessionAuthService.requireAdmin(session);
        return iotService.createAdminSampleProject(request);
    }

    @PutMapping("/iot/sample-projects/{id}")
    public IotSampleProjectResponse updateIotSampleProject(
            @PathVariable Long id,
            @Valid @RequestBody IotSampleProjectRequest request,
            HttpSession session
    ) {
        sessionAuthService.requireAdmin(session);
        return iotService.updateAdminSampleProject(id, request);
    }

    @DeleteMapping("/iot/sample-projects/{id}")
    public void deleteIotSampleProject(
            @PathVariable Long id,
            HttpSession session
    ) {
        sessionAuthService.requireAdmin(session);
        iotService.deleteAdminSampleProject(id);
    }
}
