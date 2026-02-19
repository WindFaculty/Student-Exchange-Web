package com.ssg.iot.dto.cart;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CartItemResponse {
    private Long listingId;
    private String title;
    private BigDecimal price;
    private int quantity;
    private String imageUrl;
    private BigDecimal subtotal;
}
