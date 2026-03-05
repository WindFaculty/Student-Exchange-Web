package com.ssg.iot.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.common.UnauthorizedException;
import com.ssg.iot.dto.auth.ZaloProfileResponse;
import com.ssg.iot.dto.auth.ZaloTokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ZaloOAuthClient implements ZaloOAuthGateway {

    private static final String ZALO_AUTHORIZE_URL = "https://oauth.zaloapp.com/v4/permission";
    private static final String ZALO_ACCESS_TOKEN_URL = "https://oauth.zaloapp.com/v4/access_token";
    private static final String ZALO_PROFILE_URL = "https://graph.zalo.me/v2.0/me";
    private static final String PLACEHOLDER_ZALO_APP_ID = "placeholder-zalo-app-id";
    private static final String PLACEHOLDER_ZALO_APP_SECRET = "placeholder-zalo-app-secret";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${zalo.app.id}")
    private String zaloAppId;

    @Value("${zalo.app.secret}")
    private String zaloAppSecret;

    @Value("${zalo.oauth.redirect-uri}")
    private String zaloRedirectUri;

    @Override
    public String buildAuthorizeUrl(String state) {
        validateOAuthConfiguration(false);
        return UriComponentsBuilder.fromHttpUrl(ZALO_AUTHORIZE_URL)
                .queryParam("app_id", zaloAppId)
                .queryParam("redirect_uri", zaloRedirectUri)
                .queryParam("state", state)
                .build(true)
                .toUriString();
    }

    @Override
    public ZaloTokenResponse exchangeAuthorizationCode(String code) {
        validateOAuthConfiguration(true);
        String body = "app_id=" + urlEncode(zaloAppId)
                + "&code=" + urlEncode(code)
                + "&grant_type=authorization_code"
                + "&redirect_uri=" + urlEncode(zaloRedirectUri);

        HttpRequest request = HttpRequest.newBuilder(URI.create(ZALO_ACCESS_TOKEN_URL))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("secret_key", zaloAppSecret)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = sendRequest(request);
        ZaloTokenResponse tokenResponse = parseTokenResponse(response.body());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new UnauthorizedException(extractTokenError(tokenResponse));
        }
        if (tokenResponse.getError() != null || isBlank(tokenResponse.getAccessToken())) {
            throw new UnauthorizedException(extractTokenError(tokenResponse));
        }
        return tokenResponse;
    }

    @Override
    public ZaloProfileResponse fetchUserProfile(String accessToken) {
        String url = UriComponentsBuilder.fromHttpUrl(ZALO_PROFILE_URL)
                .queryParam("fields", "id,name,email,picture")
                .build(true)
                .toUriString();

        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .timeout(Duration.ofSeconds(15))
                .header("access_token", accessToken)
                .GET()
                .build();

        HttpResponse<String> response = sendRequest(request);
        ZaloProfileResponse profileResponse = parseProfileResponse(response.body());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new UnauthorizedException(extractProfileError(profileResponse));
        }
        if (profileResponse.getError() != null || isBlank(profileResponse.getId())) {
            throw new UnauthorizedException(extractProfileError(profileResponse));
        }
        return profileResponse;
    }

    private HttpResponse<String> sendRequest(HttpRequest request) {
        try {
            return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException e) {
            throw new UnauthorizedException("Failed to call Zalo OAuth endpoint");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new UnauthorizedException("Failed to call Zalo OAuth endpoint");
        }
    }

    private ZaloTokenResponse parseTokenResponse(String body) {
        try {
            return objectMapper.readValue(body, ZaloTokenResponse.class);
        } catch (Exception ex) {
            throw new UnauthorizedException("Failed to parse Zalo token response");
        }
    }

    private ZaloProfileResponse parseProfileResponse(String body) {
        try {
            return objectMapper.readValue(body, ZaloProfileResponse.class);
        } catch (Exception ex) {
            throw new UnauthorizedException("Failed to parse Zalo profile response");
        }
    }

    private String extractTokenError(ZaloTokenResponse tokenResponse) {
        if (!isBlank(tokenResponse.getErrorDescription())) {
            return tokenResponse.getErrorDescription();
        }
        if (!isBlank(tokenResponse.getErrorReason())) {
            return tokenResponse.getErrorReason();
        }
        if (!isBlank(tokenResponse.getErrorName())) {
            return tokenResponse.getErrorName();
        }
        return "Failed to exchange Zalo authorization code";
    }

    private String extractProfileError(ZaloProfileResponse profileResponse) {
        if (!isBlank(profileResponse.getMessage())) {
            return profileResponse.getMessage();
        }
        return "Failed to fetch Zalo user profile";
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private void validateOAuthConfiguration(boolean requireSecret) {
        List<String> invalidVariables = new ArrayList<>();
        if (isInvalidValue(zaloAppId, PLACEHOLDER_ZALO_APP_ID)) {
            invalidVariables.add("ZALO_APP_ID");
        }
        if (isInvalidRedirectUri(zaloRedirectUri)) {
            invalidVariables.add("ZALO_REDIRECT_URI");
        }
        if (requireSecret && isInvalidValue(zaloAppSecret, PLACEHOLDER_ZALO_APP_SECRET)) {
            invalidVariables.add("ZALO_APP_SECRET");
        }

        if (!invalidVariables.isEmpty()) {
            throw new BadRequestException("Zalo OAuth is not configured correctly. Set valid values for: "
                    + String.join(", ", invalidVariables));
        }
    }

    private boolean isInvalidValue(String value, String placeholderValue) {
        if (isBlank(value)) {
            return true;
        }
        String normalized = value.trim();
        if (normalized.equalsIgnoreCase(placeholderValue)) {
            return true;
        }
        return looksLikeTemplateValue(normalized);
    }

    private boolean isInvalidRedirectUri(String redirectUri) {
        if (isInvalidValue(redirectUri, "")) {
            return true;
        }
        try {
            URI uri = URI.create(redirectUri.trim());
            String scheme = uri.getScheme();
            return scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https")) || isBlank(uri.getHost());
        } catch (Exception ex) {
            return true;
        }
    }

    private boolean looksLikeTemplateValue(String value) {
        return value.startsWith("<") && value.endsWith(">");
    }
}
