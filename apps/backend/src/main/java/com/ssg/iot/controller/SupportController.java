package com.ssg.iot.controller;

import com.ssg.iot.dto.support.FaqResponse;
import com.ssg.iot.dto.support.SupportTicketRequest;
import com.ssg.iot.dto.support.SupportTicketResponse;
import com.ssg.iot.service.SupportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;

    @GetMapping("/faqs")
    public List<FaqResponse> getFaqs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search
    ) {
        return supportService.getFaqs(category, search);
    }

    @PostMapping("/support/tickets")
    public SupportTicketResponse createTicket(@Valid @RequestBody SupportTicketRequest request) {
        return supportService.createTicket(request);
    }

    @GetMapping("/support/tickets/track")
    public SupportTicketResponse trackTicket(@RequestParam String ticketCode, @RequestParam String email) {
        return supportService.trackTicket(ticketCode, email);
    }
}
