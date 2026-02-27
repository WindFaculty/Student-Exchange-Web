package com.ssg.iot.dto.iot;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class IotSampleProjectRequest {
    @NotBlank
    private String slug;

    @NotBlank
    private String title;

    @NotBlank
    private String categoryCode;

    private String summary;

    private String description;

    @NotEmpty
    private List<@NotBlank String> mainComponents;

    private String difficulty;

    private String buildTime;

    private String mcuSoc;

    private String connectivity;

    @NotBlank
    private String projectPath;

    @NotBlank
    private String readmePath;

    @NotBlank
    private String pinoutPath;

    @NotBlank
    private String principlePath;

    @NotBlank
    private String sourcesPath;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    @Min(0)
    private int stock;

    private String imageUrl;

    @NotNull
    private Boolean active;
}
