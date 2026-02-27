package com.ssg.iot.service;

import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.common.NotFoundException;
import com.ssg.iot.common.PageResponse;
import com.ssg.iot.domain.Faq;
import com.ssg.iot.domain.RefSupportTicketStatus;
import com.ssg.iot.domain.SupportTicket;
import com.ssg.iot.dto.support.*;
import com.ssg.iot.repository.FaqRepository;
import com.ssg.iot.repository.RefSupportTicketStatusRepository;
import com.ssg.iot.repository.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupportService {

    private static final DateTimeFormatter TICKET_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final FaqRepository faqRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final RefSupportTicketStatusRepository ticketStatusRepository;

    @Transactional(readOnly = true)
    public List<FaqResponse> getFaqs(String category, String search) {
        Specification<Faq> spec = Specification.where((root, query, cb) -> cb.isTrue(root.get("active")));

        if (category != null && !category.isBlank()) {
            String categoryValue = category.trim().toLowerCase(Locale.ROOT);
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("category")), categoryValue));
        }

        if (search != null && !search.isBlank()) {
            String keyword = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("question")), keyword),
                    cb.like(cb.lower(root.get("answer")), keyword)
            ));
        }

        return faqRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "displayOrder"))
                .stream()
                .map(this::toFaqResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SupportTicketResponse createTicket(SupportTicketRequest request) {
        SupportTicket ticket = SupportTicket.builder()
                .ticketCode(generateTicketCode())
                .name(request.getName().trim())
                .email(request.getEmail().trim())
                .subject(request.getSubject().trim())
                .category(request.getCategory().trim())
                .message(request.getMessage().trim())
                .status(getStatusOrThrow("PENDING"))
                .build();
        return toTicketResponse(supportTicketRepository.save(ticket));
    }

    @Transactional(readOnly = true)
    public SupportTicketResponse trackTicket(String ticketCode, String email) {
        SupportTicket ticket = supportTicketRepository.findByTicketCodeAndEmailIgnoreCase(ticketCode, email)
                .orElseThrow(() -> new NotFoundException("Ticket not found"));
        return toTicketResponse(ticket);
    }

    @Transactional(readOnly = true)
    public PageResponse<SupportTicketResponse> getAdminTickets(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<SupportTicket> ticketPage;

        if (status != null && !status.isBlank()) {
            String parsedStatus = parseStatus(status);
            ticketPage = supportTicketRepository.findByStatus_CodeIgnoreCase(parsedStatus, pageable);
        } else {
            ticketPage = supportTicketRepository.findAll(pageable);
        }

        Page<SupportTicketResponse> mapped = ticketPage.map(this::toTicketResponse);
        return PageResponse.from(mapped);
    }

    @Transactional
    public SupportTicketResponse updateStatus(Long ticketId, String status) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new NotFoundException("Ticket not found"));
        ticket.setStatus(getStatusOrThrow(parseStatus(status)));
        return toTicketResponse(supportTicketRepository.save(ticket));
    }

    @Transactional
    public SupportTicketResponse reply(Long ticketId, String reply) {
        if (reply == null || reply.isBlank()) {
            throw new BadRequestException("Reply must not be empty");
        }

        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new NotFoundException("Ticket not found"));

        ticket.setAdminReply(reply.trim());
        ticket.setRepliedAt(LocalDateTime.now());

        if ("PENDING".equals(ticket.getStatus().getCode())) {
            ticket.setStatus(getStatusOrThrow("IN_PROGRESS"));
        }

        return toTicketResponse(supportTicketRepository.save(ticket));
    }

    private String generateTicketCode() {
        return "TCK" + LocalDateTime.now().format(TICKET_TIME_FORMAT);
    }

    private String parseStatus(String value) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("status is required");
        }

        String code = value.trim().toUpperCase(Locale.ROOT);
        if (ticketStatusRepository.findByCodeIgnoreCaseAndActiveTrue(code).isEmpty()) {
            throw new BadRequestException("Invalid support ticket status: " + value);
        }
        return code;
    }

    private RefSupportTicketStatus getStatusOrThrow(String code) {
        return ticketStatusRepository.findByCodeIgnoreCaseAndActiveTrue(code)
                .orElseThrow(() -> new NotFoundException("Support status not found: " + code));
    }

    private FaqResponse toFaqResponse(Faq faq) {
        return FaqResponse.builder()
                .id(faq.getId())
                .category(faq.getCategory())
                .question(faq.getQuestion())
                .answer(faq.getAnswer())
                .displayOrder(faq.getDisplayOrder())
                .build();
    }

    private SupportTicketResponse toTicketResponse(SupportTicket ticket) {
        return SupportTicketResponse.builder()
                .id(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .name(ticket.getName())
                .email(ticket.getEmail())
                .subject(ticket.getSubject())
                .category(ticket.getCategory())
                .message(ticket.getMessage())
                .status(ticket.getStatus().getCode())
                .adminReply(ticket.getAdminReply())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .repliedAt(ticket.getRepliedAt())
                .build();
    }
}
