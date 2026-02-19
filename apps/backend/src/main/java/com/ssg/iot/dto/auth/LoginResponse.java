package com.ssg.iot.dto.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private boolean success;
    private String message;
    private UserSessionResponse user;
}
