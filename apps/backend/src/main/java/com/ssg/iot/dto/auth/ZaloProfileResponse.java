package com.ssg.iot.dto.auth;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ZaloProfileResponse {
    private String id;
    private String name;
    private String email;
    private Integer error;
    private String message;
    private Picture picture;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Picture {
        private PictureData data;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PictureData {
        private String url;
    }
}
