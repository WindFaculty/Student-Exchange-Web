package com.ssg.iot.dto.order;

import com.ssg.iot.domain.CatalogSourceType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class OrderItemResponse {
    private Long catalogItemId;
    private CatalogSourceType sourceType;
    private Long sourceRefId;
    private String title;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
