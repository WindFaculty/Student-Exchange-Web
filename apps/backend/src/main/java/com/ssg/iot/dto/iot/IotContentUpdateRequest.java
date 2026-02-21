package com.ssg.iot.dto.iot;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class IotContentUpdateRequest {
    @NotBlank
    private String heroTitle;

    @NotBlank
    private String heroSubtitle;

    private String heroImageUrl;

    @NotBlank
    private String primaryCtaLabel;

    @NotBlank
    @Pattern(regexp = "^/.*", message = "primaryCtaHref must start with /")
    private String primaryCtaHref;

    @NotNull
    @Size(max = 6)
    private List<@Valid IotHighlightUpdateRequest> highlights = new ArrayList<>();
}
