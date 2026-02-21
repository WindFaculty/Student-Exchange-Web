package com.ssg.iot.dto.iot;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class IotContentResponse {
    private Long id;
    private String heroTitle;
    private String heroSubtitle;
    private String heroImageUrl;
    private String primaryCtaLabel;
    private String primaryCtaHref;
    private List<IotHighlightResponse> highlights;
}
