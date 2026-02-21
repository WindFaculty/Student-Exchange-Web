package com.ssg.iot.dto.iot;

import com.ssg.iot.common.PageResponse;
import com.ssg.iot.dto.listing.ListingResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class IotOverviewResponse {
    private String heroTitle;
    private String heroSubtitle;
    private String heroImageUrl;
    private String primaryCtaLabel;
    private String primaryCtaHref;
    private List<IotHighlightResponse> highlights;
    private List<String> categoryOptions;
    private PageResponse<ListingResponse> listings;
}
