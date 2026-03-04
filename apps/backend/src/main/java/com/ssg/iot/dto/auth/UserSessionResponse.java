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
    private String phone;
    private String address;
    private String addressLine;
    private String provinceCode;
    private String wardCode;
    private UserRole role;
    private String avatarUrl;
}
