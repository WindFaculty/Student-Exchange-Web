package com.ssg.iot.service;

import com.ssg.iot.common.UnauthorizedException;
import com.ssg.iot.domain.User;
import com.ssg.iot.dto.auth.UserSessionResponse;
import com.ssg.iot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public User authenticate(String username, String password) {
        User user = userRepository.findByUsernameAndActiveTrue(username)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!user.getPassword().equals(password)) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return user;
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
}
