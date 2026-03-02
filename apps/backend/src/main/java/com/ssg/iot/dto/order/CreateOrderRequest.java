package com.ssg.iot.dto.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateOrderRequest {
    @NotBlank
    @Size(max = 120)
    private String customerName;

    @Pattern(regexp = "^$|^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message = "customerEmail must be a valid email")
    @Size(max = 160)
    private String customerEmail;

    @NotBlank
    @Size(max = 500)
    private String customerAddress;

    @NotBlank
    @Size(max = 40)
    private String customerPhone;
}
