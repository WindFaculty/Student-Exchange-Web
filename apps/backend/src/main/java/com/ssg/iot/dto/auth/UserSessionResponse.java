package com.ssg.iot.dto.auth;

import com.ssg.iot.domain.UserRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserSessionResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private UserRole role;
}
