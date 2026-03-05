package com.ssg.iot.service;

import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.common.UnauthorizedException;
import com.ssg.iot.domain.RefVnProvince;
import com.ssg.iot.domain.RefVnWard;
import com.ssg.iot.domain.User;
import com.ssg.iot.domain.UserRole;
import com.ssg.iot.domain.UserSocialIdentity;
import com.ssg.iot.dto.auth.UpdateProfileRequest;
import com.ssg.iot.dto.auth.UserSessionResponse;
import com.ssg.iot.dto.auth.ZaloProfileResponse;
import com.ssg.iot.dto.auth.ZaloTokenResponse;
import com.ssg.iot.repository.UserRepository;
import com.ssg.iot.repository.UserSocialIdentityRepository;
import com.ssg.iot.service.location.VnLocationQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String ZALO_PROVIDER = "ZALO";
    private static final String ZALO_EMAIL_DOMAIN = "zalo.local";

    private final UserRepository userRepository;
    private final UserSocialIdentityRepository userSocialIdentityRepository;
    private final VnLocationQueryService locationQueryService;
    private final ZaloOAuthGateway zaloOAuthGateway;

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
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

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

    public String buildZaloAuthorizeUrl(String state) {
        return zaloOAuthGateway.buildAuthorizeUrl(state);
    }

    public ZaloTokenResponse exchangeZaloCodeForAccessToken(String code) {
        return zaloOAuthGateway.exchangeAuthorizationCode(code);
    }

    public ZaloProfileResponse fetchZaloProfile(String accessToken) {
        return zaloOAuthGateway.fetchUserProfile(accessToken);
    }

    public User authenticateWithZalo(String authorizationCode) {
        ZaloTokenResponse tokenResponse = exchangeZaloCodeForAccessToken(authorizationCode);
        ZaloProfileResponse profile = fetchZaloProfile(tokenResponse.getAccessToken());
        String providerUserId = normalizeOptional(profile.getId());
        if (providerUserId == null) {
            throw new UnauthorizedException("Zalo profile does not contain id");
        }

        return userSocialIdentityRepository.findByProviderAndProviderUserId(ZALO_PROVIDER, providerUserId)
                .map(UserSocialIdentity::getUser)
                .map(this::requireActiveUser)
                .orElseGet(() -> registerOrLinkZaloUser(profile, providerUserId));
    }

    private User registerOrLinkZaloUser(ZaloProfileResponse profile, String providerUserId) {
        String normalizedEmail = normalizeEmail(profile.getEmail());
        if (normalizedEmail == null) {
            User createdUser = createZaloUser(profile, generateUniquePseudoEmail(providerUserId), providerUserId);
            ensureZaloIdentity(createdUser, providerUserId);
            return createdUser;
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .map(this::requireActiveUser)
                .orElseGet(() -> createZaloUser(profile, normalizedEmail, providerUserId));

        ensureZaloIdentity(user, providerUserId);
        return user;
    }

    private User requireActiveUser(User user) {
        if (!user.isActive()) {
            throw new UnauthorizedException("Account is inactive");
        }
        return user;
    }

    private void ensureZaloIdentity(User user, String providerUserId) {
        UserSocialIdentity existingIdentity = userSocialIdentityRepository
                .findByUserIdAndProvider(user.getId(), ZALO_PROVIDER)
                .orElse(null);

        if (existingIdentity != null) {
            if (!existingIdentity.getProviderUserId().equals(providerUserId)) {
                throw new UnauthorizedException("This account is already linked with another Zalo account");
            }
            return;
        }

        userSocialIdentityRepository.save(UserSocialIdentity.builder()
                .user(user)
                .provider(ZALO_PROVIDER)
                .providerUserId(providerUserId)
                .build());
    }

    private User createZaloUser(ZaloProfileResponse profile, String email, String providerUserId) {
        String username = generateUniqueUsername(buildBaseUsername(profile.getName(), providerUserId));

        User user = User.builder()
                .username(username)
                .password(UUID.randomUUID().toString())
                .fullName(defaultIfBlank(profile.getName(), username))
                .email(email)
                .role(UserRole.USER)
                .active(true)
                .avatarUrl(extractAvatarUrl(profile))
                .build();

        return userRepository.save(user);
    }

    private String extractAvatarUrl(ZaloProfileResponse profile) {
        if (profile.getPicture() == null || profile.getPicture().getData() == null) {
            return null;
        }
        return normalizeOptional(profile.getPicture().getData().getUrl());
    }

    private String buildBaseUsername(String displayName, String providerUserId) {
        String fromDisplayName = normalizeOptional(displayName);
        if (fromDisplayName != null) {
            String normalized = fromDisplayName.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
            if (!normalized.isBlank()) {
                return normalized;
            }
        }

        String fromProviderId = providerUserId.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
        if (!fromProviderId.isBlank()) {
            return "zalo" + fromProviderId;
        }
        return "zalo";
    }

    private String generateUniqueUsername(String baseUsername) {
        String normalizedBase = baseUsername.length() > 60 ? baseUsername.substring(0, 60) : baseUsername;
        String candidate = normalizedBase;
        int counter = 1;
        while (userRepository.existsByUsernameIgnoreCase(candidate)) {
            candidate = normalizedBase + counter++;
        }
        return candidate;
    }

    private String buildPseudoEmail(String providerUserId) {
        String normalizedId = providerUserId.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
        if (normalizedId.isBlank()) {
            normalizedId = UUID.randomUUID().toString().replace("-", "");
        }
        return "zalo_" + normalizedId + "@" + ZALO_EMAIL_DOMAIN;
    }

    private String generateUniquePseudoEmail(String providerUserId) {
        String baseEmail = buildPseudoEmail(providerUserId);
        if (!userRepository.existsByEmailIgnoreCase(baseEmail)) {
            return baseEmail;
        }

        int separator = baseEmail.indexOf('@');
        String localPart = baseEmail.substring(0, separator);
        String domainPart = baseEmail.substring(separator);
        int counter = 1;
        String candidate = localPart + counter + domainPart;
        while (userRepository.existsByEmailIgnoreCase(candidate)) {
            counter++;
            candidate = localPart + counter + domainPart;
        }
        return candidate;
    }

    private String normalizeEmail(String email) {
        String normalized = normalizeOptional(email);
        if (normalized == null) {
            return null;
        }
        String lowered = normalized.toLowerCase(Locale.ROOT);
        return lowered.contains("@") ? lowered : null;
    }

    private String defaultIfBlank(String value, String fallback) {
        String normalized = normalizeOptional(value);
        return normalized != null ? normalized : fallback;
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
