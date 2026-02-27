package com.ssg.iot.dto.cart;

import com.ssg.iot.domain.CatalogSourceType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CartItemResponse {
    private Long catalogItemId;
    private CatalogSourceType sourceType;
    private Long sourceRefId;
    private String title;
    private BigDecimal price;
    private int quantity;
    private String imageUrl;
    private BigDecimal subtotal;
}
