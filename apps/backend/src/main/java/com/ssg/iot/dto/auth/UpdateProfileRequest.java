package com.ssg.iot.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank
    @Size(max = 120)
    private String fullName;

    @NotBlank
    @Email
    @Size(max = 160)
    private String email;

    @Size(max = 40)
    @Pattern(
            regexp = "^$|^(0\\d{9}|\\+84\\d{9})$",
            message = "phone must match 0xxxxxxxxx or +84xxxxxxxxx"
    )
    private String phone;

    @Size(max = 500)
    private String address;

    @Size(max = 500)
    private String addressLine;

    @Size(max = 40)
    private String provinceCode;

    @Size(max = 40)
    private String districtCode;

    @Size(max = 40)
    private String wardCode;
}
