package com.ssg.iot.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "support_tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String ticketCode;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 160)
    private String email;

    @Column(nullable = false, length = 250)
    private String subject;

    @Column(nullable = false, length = 80)
    private String category;

    @Column(nullable = false, length = 4000)
    private String message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id", nullable = false)
    private RefSupportTicketStatus status;

    @Column(length = 4000)
    private String adminReply;

    private LocalDateTime repliedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
