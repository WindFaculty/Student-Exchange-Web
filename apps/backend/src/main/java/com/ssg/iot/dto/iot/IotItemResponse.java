package com.ssg.iot.dto.iot;

import com.ssg.iot.dto.common.CategoryOptionResponse;
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
    private Long catalogItemId;
    private String title;
    private String description;
    private CategoryOptionResponse category;
    private BigDecimal price;
    private int stock;
    private String imageUrl;
    private boolean purchasable;
    private LocalDateTime createdAt;
}
