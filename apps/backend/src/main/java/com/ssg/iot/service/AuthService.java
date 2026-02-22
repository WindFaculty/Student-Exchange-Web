package com.ssg.iot.service;

import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.common.UnauthorizedException;
import com.ssg.iot.domain.User;
import com.ssg.iot.domain.UserRole;
import com.ssg.iot.dto.auth.UserSessionResponse;
import com.ssg.iot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    @Value("${google.client.id}")
    private String googleClientId;

    public User authenticate(String username, String password) {
        User user = userRepository.findByUsernameAndActiveTrue(username)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!user.getPassword().equals(password)) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return user;
    }

    public User register(String username, String email, String password) {
        String normalizedUsername = username.trim();
        String normalizedEmail = email.trim().toLowerCase();

        if (userRepository.existsByUsernameIgnoreCase(normalizedUsername)) {
            throw new BadRequestException("Username is already taken");
        }

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .username(normalizedUsername)
                .password(password)
                .fullName(normalizedUsername)
                .email(normalizedEmail)
                .role(UserRole.USER)
                .active(true)
                .build();

        return userRepository.save(user);
    }

    public UserSessionResponse toSessionResponse(User user) {
        return UserSessionResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public User authenticateWithGoogle(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");

                return userRepository.findByEmailIgnoreCase(email)
                        .orElseGet(() -> createGoogleUser(email, name));
            } else {
                throw new UnauthorizedException("Invalid Google ID Token");
            }
        } catch (Exception e) {
            throw new UnauthorizedException("Failed to verify Google ID Token");
        }
    }

    private User createGoogleUser(String email, String name) {
        String baseUsername = email.split("@")[0].toLowerCase().replaceAll("[^a-z0-9]", "");
        String username = baseUsername;
        int counter = 1;
        while (userRepository.existsByUsernameIgnoreCase(username)) {
            username = baseUsername + counter++;
        }

        String randomPassword = UUID.randomUUID().toString();
        
        User user = User.builder()
                .username(username)
                .password(randomPassword)
                .fullName(name != null ? name : username)
                .email(email)
                .role(UserRole.USER)
                .active(true)
                .build();

        return userRepository.save(user);
    }
}
