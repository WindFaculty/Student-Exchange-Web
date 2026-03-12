package com.ssg.iot.controller;

import com.ssg.iot.config.GlobalExceptionHandler;
import com.ssg.iot.service.AuthService;
import com.ssg.iot.service.SessionAuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthZaloDisabledIntegrationTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        AuthController controller = new AuthController(
                new AuthService(null, null, null, null),
                new SessionAuthService(null)
        );
        ReflectionTestUtils.setField(controller, "frontendBaseUrl", "http://localhost:5173");
        ReflectionTestUtils.setField(controller, "zaloAuthEnabled", false);

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void zaloAuthorizeReturnsServiceUnavailableWhenFeatureIsDisabled() throws Exception {
        mockMvc.perform(get("/api/auth/zalo/authorize")
                        .param("returnTo", "/products"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.message", containsString("Zalo login is temporarily disabled")));
    }

    @Test
    void zaloCallbackReturnsServiceUnavailableWhenFeatureIsDisabled() throws Exception {
        mockMvc.perform(get("/api/auth/zalo/callback")
                        .param("code", "sample-code")
                        .param("state", "sample-state"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.message", containsString("Zalo login is temporarily disabled")));
    }
}
