package com.ssg.iot.dto.support;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FaqResponse {
    private Long id;
    private String category;
    private String question;
    private String answer;
    private int displayOrder;
}
