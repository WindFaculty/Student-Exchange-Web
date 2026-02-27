package com.ssg.iot.dto.order;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private String orderCode;
    private String customerName;
    private String customerEmail;
    private String customerAddress;
    private String status;
    private BigDecimal totalAmount;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
}
