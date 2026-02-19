package com.ssg.iot.controller;

import com.ssg.iot.domain.User;
import com.ssg.iot.dto.auth.LoginRequest;
import com.ssg.iot.dto.auth.LoginResponse;
import com.ssg.iot.dto.auth.UserSessionResponse;
import com.ssg.iot.service.AuthService;
import com.ssg.iot.service.SessionAuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SessionAuthService sessionAuthService;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        User user = authService.authenticate(request.getUsername(), request.getPassword());
        sessionAuthService.login(session, user);

        return LoginResponse.builder()
                .success(true)
                .message("Login successful")
                .user(authService.toSessionResponse(user))
                .build();
    }

    @PostMapping("/logout")
    public LoginResponse logout(HttpSession session) {
        sessionAuthService.logout(session);
        return LoginResponse.builder()
                .success(true)
                .message("Logged out")
                .build();
    }

    @GetMapping("/me")
    public UserSessionResponse me(HttpSession session) {
        User user = sessionAuthService.requireUser(session);
        return authService.toSessionResponse(user);
    }
}
