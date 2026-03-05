package com.ssg.iot.dto.auth;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ZaloTokenResponse {
    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("refresh_token")
    private String refreshToken;

    @JsonProperty("expires_in")
    private Long expiresIn;

    @JsonProperty("error")
    private Integer error;

    @JsonProperty("error_name")
    private String errorName;

    @JsonProperty("error_reason")
    private String errorReason;

    @JsonProperty("error_description")
    private String errorDescription;
}
