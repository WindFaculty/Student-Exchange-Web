package com.ssg.iot.dto.listing;

import com.ssg.iot.dto.common.CategoryOptionResponse;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ListingResponse {
    private Long id;
    private String title;
    private String description;
    private CategoryOptionResponse category;
    private Long catalogItemId;
    private BigDecimal price;
    private int stock;
    private String imageUrl;
    private boolean active;
    private Long ownerId;
    private String ownerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
