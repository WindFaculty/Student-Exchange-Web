package com.ssg.iot.controller;

import com.ssg.iot.common.UnauthorizedException;
import com.ssg.iot.domain.User;
import com.ssg.iot.domain.UserRole;
import com.ssg.iot.domain.UserSocialIdentity;
import com.ssg.iot.dto.auth.ZaloProfileResponse;
import com.ssg.iot.dto.auth.ZaloTokenResponse;
import com.ssg.iot.repository.UserRepository;
import com.ssg.iot.repository.UserSocialIdentityRepository;
import com.ssg.iot.service.SessionAuthService;
import com.ssg.iot.service.ZaloOAuthGateway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Locale;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class AuthZaloFlowIntegrationTest {

    private static final String ZALO_PROVIDER = "ZALO";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSocialIdentityRepository userSocialIdentityRepository;

    @MockBean
    private ZaloOAuthGateway zaloOAuthGateway;

    @Test
    void zaloAuthorizeRedirectsToOauthHostWithRequiredParams() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/auth/zalo/authorize")
                        .param("returnTo", "/orders"))
                .andExpect(status().isFound())
                .andReturn();

        String location = result.getResponse().getHeader(HttpHeaders.LOCATION);
        assertNotNull(location);

        URI uri = URI.create(location);
        assertEquals("oauth.zaloapp.com", uri.getHost());
        assertEquals("/v4/permission", uri.getPath());

        var queryParams = UriComponentsBuilder.fromUriString(location).build(true).getQueryParams();
        assertNotNull(queryParams.getFirst("app_id"));
        assertNotNull(queryParams.getFirst("redirect_uri"));
        assertTrue(queryParams.getFirst("redirect_uri").contains("/api/auth/zalo/callback"));
        assertNotNull(queryParams.getFirst("state"));
        assertFalse(queryParams.getFirst("state").isBlank());
    }

    @Test
    void zaloCallbackRejectsInvalidAndMissingState() throws Exception {
        OAuthStart start = startOAuth("/products");

        mockMvc.perform(get("/api/auth/zalo/callback")
                        .session(start.session())
                        .param("code", "any-code")
                        .param("state", "invalid-" + start.state()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", containsString("Invalid OAuth state")));

        assertNull(start.session().getAttribute(SessionAuthService.SESSION_USER_ID));

        OAuthStart missingStateStart = startOAuth("/products");
        mockMvc.perform(get("/api/auth/zalo/callback")
                        .session(missingStateStart.session())
                        .param("code", "any-code"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Missing required parameter: state")));
    }

    @Test
    void zaloCallbackReturnsUnauthorizedWhenTokenExchangeFails() throws Exception {
        OAuthStart start = startOAuth("/products");
        when(zaloOAuthGateway.exchangeAuthorizationCode("bad-code"))
                .thenThrow(new UnauthorizedException("Failed to exchange Zalo authorization code"));

        mockMvc.perform(get("/api/auth/zalo/callback")
                        .session(start.session())
                        .param("code", "bad-code")
                        .param("state", start.state()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", containsString("Failed to exchange Zalo authorization code")));

        assertNull(start.session().getAttribute(SessionAuthService.SESSION_USER_ID));
    }

    @Test
    void zaloCallbackLogsInExistingIdentityUser() throws Exception {
        String suffix = randomSuffix();
        User existingUser = userRepository.save(User.builder()
                .username("zalo_existing_" + suffix.substring(0, 8))
                .password("secret123")
                .fullName("Existing Zalo User")
                .email("zalo-existing-" + suffix + "@example.com")
                .role(UserRole.USER)
                .active(true)
                .build());
        String providerUserId = "zalo-existing-id-" + suffix;
        userSocialIdentityRepository.save(UserSocialIdentity.builder()
                .user(existingUser)
                .provider(ZALO_PROVIDER)
                .providerUserId(providerUserId)
                .build());

        when(zaloOAuthGateway.exchangeAuthorizationCode("good-code"))
                .thenReturn(tokenResponse("access-token-" + suffix));
        when(zaloOAuthGateway.fetchUserProfile("access-token-" + suffix))
                .thenReturn(profileResponse(providerUserId, "Different Profile Name", "different-" + suffix + "@example.com"));

        OAuthStart start = startOAuth("/orders");
        mockMvc.perform(get("/api/auth/zalo/callback")
                        .session(start.session())
                        .param("code", "good-code")
                        .param("state", start.state()))
                .andExpect(status().isFound())
                .andExpect(header().string(HttpHeaders.LOCATION, containsString("/orders")));

        mockMvc.perform(get("/api/auth/me").session(start.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(existingUser.getId().intValue())))
                .andExpect(jsonPath("$.email", is(existingUser.getEmail())))
                .andExpect(jsonPath("$.username", is(existingUser.getUsername())));
    }

    @Test
    void zaloCallbackCreatesUserWithPseudoEmailWhenEmailMissing() throws Exception {
        String providerUserId = "987654321";
        String suffix = randomSuffix();
        long userCountBefore = userRepository.count();

        when(zaloOAuthGateway.exchangeAuthorizationCode("no-email-code"))
                .thenReturn(tokenResponse("access-no-email-" + suffix));
        when(zaloOAuthGateway.fetchUserProfile("access-no-email-" + suffix))
                .thenReturn(profileResponse(providerUserId, "No Email User", null));

        OAuthStart start = startOAuth("/products");
        mockMvc.perform(get("/api/auth/zalo/callback")
                        .session(start.session())
                        .param("code", "no-email-code")
                        .param("state", start.state()))
                .andExpect(status().isFound())
                .andExpect(header().string(HttpHeaders.LOCATION, containsString("/products")));

        assertEquals(userCountBefore + 1, userRepository.count());
        String expectedEmail = "zalo_" + providerUserId.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "") + "@zalo.local";
        User createdUser = userRepository.findByEmailIgnoreCase(expectedEmail).orElseThrow();
        UserSocialIdentity identity = userSocialIdentityRepository
                .findByProviderAndProviderUserId(ZALO_PROVIDER, providerUserId)
                .orElseThrow();
        assertEquals(createdUser.getId(), identity.getUser().getId());

        mockMvc.perform(get("/api/auth/me").session(start.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(createdUser.getId().intValue())))
                .andExpect(jsonPath("$.email", is(expectedEmail)));
    }

    @Test
    void zaloCallbackLinksIdentityToExistingEmailUserWithoutCreatingNewUser() throws Exception {
        String suffix = randomSuffix();
        String email = "zalo-link-" + suffix + "@example.com";
        User existingUser = userRepository.save(User.builder()
                .username("zalo_link_" + suffix.substring(0, 8))
                .password("secret123")
                .fullName("Existing Email User")
                .email(email)
                .role(UserRole.USER)
                .active(true)
                .build());
        long userCountBefore = userRepository.count();
        String providerUserId = "zalo-link-id-" + suffix;

        when(zaloOAuthGateway.exchangeAuthorizationCode("link-email-code"))
                .thenReturn(tokenResponse("access-link-email-" + suffix));
        when(zaloOAuthGateway.fetchUserProfile("access-link-email-" + suffix))
                .thenReturn(profileResponse(providerUserId, "Linked User Name", email));

        OAuthStart start = startOAuth("/products");
        mockMvc.perform(get("/api/auth/zalo/callback")
                        .session(start.session())
                        .param("code", "link-email-code")
                        .param("state", start.state()))
                .andExpect(status().isFound())
                .andExpect(header().string(HttpHeaders.LOCATION, containsString("/products")));

        assertEquals(userCountBefore, userRepository.count());
        User linkedUser = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertEquals(existingUser.getId(), linkedUser.getId());

        UserSocialIdentity identity = userSocialIdentityRepository
                .findByProviderAndProviderUserId(ZALO_PROVIDER, providerUserId)
                .orElseThrow();
        assertEquals(existingUser.getId(), identity.getUser().getId());

        mockMvc.perform(get("/api/auth/me").session(start.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(existingUser.getId().intValue())))
                .andExpect(jsonPath("$.email", is(email)));
    }

    private OAuthStart startOAuth(String returnTo) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/auth/zalo/authorize")
                        .param("returnTo", returnTo))
                .andExpect(status().isFound())
                .andReturn();
        MockHttpSession session = (MockHttpSession) result.getRequest().getSession(false);
        assertNotNull(session);

        String location = result.getResponse().getHeader(HttpHeaders.LOCATION);
        assertNotNull(location);
        String state = UriComponentsBuilder.fromUriString(location)
                .build(true)
                .getQueryParams()
                .getFirst("state");
        assertNotNull(state);

        return new OAuthStart(session, state);
    }

    private ZaloTokenResponse tokenResponse(String accessToken) {
        ZaloTokenResponse response = new ZaloTokenResponse();
        response.setAccessToken(accessToken);
        response.setExpiresIn(3600L);
        return response;
    }

    private ZaloProfileResponse profileResponse(String id, String name, String email) {
        ZaloProfileResponse response = new ZaloProfileResponse();
        response.setId(id);
        response.setName(name);
        response.setEmail(email);
        return response;
    }

    private String randomSuffix() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private record OAuthStart(MockHttpSession session, String state) {
    }
}
