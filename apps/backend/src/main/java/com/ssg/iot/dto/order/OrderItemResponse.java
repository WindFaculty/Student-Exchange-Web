package com.ssg.iot.dto.order;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class OrderItemResponse {
    private Long listingId;
    private String listingTitle;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
