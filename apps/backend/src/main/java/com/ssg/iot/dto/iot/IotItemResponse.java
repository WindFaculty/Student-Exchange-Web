package com.ssg.iot.dto.iot;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Shared lightweight response DTO for both iot_components and iot_sample_products.
 */
@Data
@Builder
public class IotItemResponse {
    private Long id;
    private String slug;
    private Long listingId;
    private String title;
    private String description;
    private String category;   // null for sample products
    private BigDecimal price;
    private int stock;
    private String imageUrl;
    private boolean listingActive;
    private LocalDateTime createdAt;
}
