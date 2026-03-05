package com.ssg.iot.controller;

import com.ssg.iot.common.UnauthorizedException;
import com.ssg.iot.domain.User;
import com.ssg.iot.dto.auth.LoginRequest;
import com.ssg.iot.dto.auth.LoginResponse;
import com.ssg.iot.dto.auth.RegisterRequest;
import com.ssg.iot.dto.auth.UserSessionResponse;
import com.ssg.iot.service.AuthService;
import com.ssg.iot.service.SessionAuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String SESSION_ZALO_OAUTH_STATE = "ZALO_OAUTH_STATE";
    private static final String SESSION_ZALO_RETURN_TO = "ZALO_RETURN_TO";
    private static final String DEFAULT_RETURN_TO = "/products";

    private final AuthService authService;
    private final SessionAuthService sessionAuthService;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

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

    @PostMapping("/register")
    public LoginResponse register(@Valid @RequestBody RegisterRequest request, HttpSession session) {
        User user = authService.register(request.getUsername(), request.getEmail(), request.getPassword());
        sessionAuthService.login(session, user);

        return LoginResponse.builder()
                .success(true)
                .message("Registration successful")
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

    @GetMapping("/zalo/authorize")
    public ResponseEntity<Void> zaloAuthorize(
            @RequestParam(value = "returnTo", required = false) String returnTo,
            HttpSession session
    ) {
        String state = UUID.randomUUID().toString();
        String normalizedReturnTo = normalizeReturnTo(returnTo);

        session.setAttribute(SESSION_ZALO_OAUTH_STATE, state);
        session.setAttribute(SESSION_ZALO_RETURN_TO, normalizedReturnTo);

        String authorizeUrl = authService.buildZaloAuthorizeUrl(state);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(authorizeUrl))
                .build();
    }

    @GetMapping("/zalo/callback")
    public ResponseEntity<Void> zaloCallback(
            @RequestParam("code") String code,
            @RequestParam("state") String state,
            HttpSession session
    ) {
        String expectedState = (String) session.getAttribute(SESSION_ZALO_OAUTH_STATE);
        String returnTo = normalizeReturnTo((String) session.getAttribute(SESSION_ZALO_RETURN_TO));

        session.removeAttribute(SESSION_ZALO_OAUTH_STATE);
        session.removeAttribute(SESSION_ZALO_RETURN_TO);

        if (expectedState == null || !expectedState.equals(state)) {
            throw new UnauthorizedException("Invalid OAuth state");
        }

        User user = authService.authenticateWithZalo(code);
        sessionAuthService.login(session, user);

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(buildFrontendUrl(returnTo)))
                .build();
    }

    private String normalizeReturnTo(String returnTo) {
        if (returnTo == null) {
            return DEFAULT_RETURN_TO;
        }
        String normalized = returnTo.trim();
        if (normalized.isEmpty()) {
            return DEFAULT_RETURN_TO;
        }
        if (!normalized.startsWith("/") || normalized.startsWith("//")) {
            return DEFAULT_RETURN_TO;
        }
        if (normalized.contains("\r") || normalized.contains("\n")) {
            return DEFAULT_RETURN_TO;
        }
        return normalized;
    }

    private String buildFrontendUrl(String path) {
        String normalizedBase = frontendBaseUrl == null ? "" : frontendBaseUrl.trim();
        if (normalizedBase.endsWith("/")) {
            normalizedBase = normalizedBase.substring(0, normalizedBase.length() - 1);
        }
        return normalizedBase + path;
    }
}
