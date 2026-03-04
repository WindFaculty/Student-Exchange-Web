package com.ssg.iot.service;

import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.common.UnauthorizedException;
import com.ssg.iot.domain.RefVnProvince;
import com.ssg.iot.domain.RefVnWard;
import com.ssg.iot.domain.User;
import com.ssg.iot.domain.UserRole;
import com.ssg.iot.dto.auth.UpdateProfileRequest;
import com.ssg.iot.dto.auth.UserSessionResponse;
import com.ssg.iot.repository.UserRepository;
import com.ssg.iot.service.location.VnLocationQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import java.util.Collections;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final VnLocationQueryService locationQueryService;

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
                .phone(user.getPhone())
                .address(user.getAddress())
                .addressLine(user.getAddressLine())
                .provinceCode(user.getProvinceCode())
                .wardCode(user.getWardCode())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    public UserSessionResponse updateProfile(User currentUser, UpdateProfileRequest request) {
        String normalizedFullName = request.getFullName().trim();
        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);
        String normalizedPhone = normalizeOptional(request.getPhone());

        if (userRepository.existsByEmailIgnoreCaseAndIdNot(normalizedEmail, currentUser.getId())) {
            throw new BadRequestException("Email is already registered");
        }

        currentUser.setFullName(normalizedFullName);
        currentUser.setEmail(normalizedEmail);
        currentUser.setPhone(normalizedPhone);
        applyAddressUpdate(currentUser, request);
        User saved = userRepository.save(currentUser);
        return toSessionResponse(saved);
    }

    public void changePassword(User currentUser, String currentPassword, String newPassword) {
        if (!currentUser.getPassword().equals(currentPassword)) {
            throw new BadRequestException("Mật khẩu hiện tại không đúng");
        }
        currentUser.setPassword(newPassword);
        userRepository.save(currentUser);
    }

    public UserSessionResponse updateAvatar(User currentUser, String avatarUrl) {
        currentUser.setAvatarUrl(avatarUrl);
        User saved = userRepository.save(currentUser);
        return toSessionResponse(saved);
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

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private void applyAddressUpdate(User currentUser, UpdateProfileRequest request) {
        String normalizedLegacyAddress = normalizeOptional(request.getAddress());
        String normalizedAddressLine = normalizeOptional(request.getAddressLine());
        String normalizedProvinceCode = normalizeOptional(request.getProvinceCode());
        String normalizedWardCode = normalizeOptional(request.getWardCode());

        boolean hasStructuredSelection = normalizedProvinceCode != null
                || normalizedWardCode != null;

        if (hasStructuredSelection) {
            if (normalizedProvinceCode == null || normalizedWardCode == null) {
                throw new BadRequestException("provinceCode and wardCode must be provided together");
            }
            RefVnProvince province = locationQueryService.getProvinceOrThrow(normalizedProvinceCode);
            RefVnWard ward = locationQueryService.getWardOrThrow(normalizedWardCode);

            if (!ward.getProvinceCode().equalsIgnoreCase(province.getCode())) {
                throw new BadRequestException("wardCode does not belong to provinceCode");
            }

            currentUser.setAddressLine(normalizedAddressLine);
            currentUser.setProvinceCode(province.getCode());
            currentUser.setWardCode(ward.getCode());
            currentUser.setAddress(buildAddress(normalizedAddressLine, ward.getNameCurrent(), province.getNameCurrent()));
            return;
        }

        if (normalizedLegacyAddress != null || normalizedAddressLine != null) {
            currentUser.setAddress(normalizedLegacyAddress != null ? normalizedLegacyAddress : normalizedAddressLine);
            clearStructuredAddress(currentUser);
            return;
        }

        currentUser.setAddress(null);
        clearStructuredAddress(currentUser);
    }

    private void clearStructuredAddress(User currentUser) {
        currentUser.setAddressLine(null);
        currentUser.setProvinceCode(null);
        currentUser.setWardCode(null);
    }

    private String buildAddress(String addressLine, String wardName, String provinceName) {
        return java.util.stream.Stream.of(addressLine, wardName, provinceName)
                .filter(value -> value != null && !value.isBlank())
                .collect(java.util.stream.Collectors.joining(", "));
    }
}
