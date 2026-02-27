package com.ssg.iot.dto.iot;

import com.ssg.iot.dto.common.CategoryOptionResponse;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class IotSampleProjectResponse {
    private Long id;
    private String slug;
    private String title;
    private String summary;
    private String description;
    private List<String> mainComponents;
    private String difficulty;
    private String buildTime;
    private String mcuSoc;
    private String connectivity;
    private String projectPath;
    private String readmePath;
    private String pinoutPath;
    private String principlePath;
    private String sourcesPath;
    private CategoryOptionResponse category;
    private Long catalogItemId;
    private BigDecimal price;
    private int stock;
    private String imageUrl;
    private boolean active;
    private boolean purchasable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
