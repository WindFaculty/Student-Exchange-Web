package com.ssg.iot.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssg.iot.common.BadRequestException;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.util.UriComponentsBuilder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ZaloOAuthClientConfigurationTest {

    @Test
    void buildAuthorizeUrlAcceptsWrappedEnvValues() {
        ZaloOAuthClient client = newClient(
                "<123456789>",
                "<secret-value>",
                "<https://www.chosinhvienfpt.id.vn/api/auth/zalo/callback>"
        );

        String authorizeUrl = client.buildAuthorizeUrl("state-123");
        var queryParams = UriComponentsBuilder.fromUriString(authorizeUrl)
                .build(true)
                .getQueryParams();

        assertEquals("123456789", queryParams.getFirst("app_id"));
        assertEquals("https://www.chosinhvienfpt.id.vn/api/auth/zalo/callback", queryParams.getFirst("redirect_uri"));
        assertEquals("state-123", queryParams.getFirst("state"));
    }

    @Test
    void buildAuthorizeUrlRejectsExampleTemplateValuesEvenWhenWrapped() {
        ZaloOAuthClient client = newClient(
                "<zalo-app-id>",
                "<zalo-app-secret>",
                "<https://your-domain/api/auth/zalo/callback>"
        );

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> client.buildAuthorizeUrl("state-abc")
        );

        assertTrue(exception.getMessage().contains("ZALO_APP_ID"));
        assertTrue(exception.getMessage().contains("ZALO_REDIRECT_URI"));
    }

    private ZaloOAuthClient newClient(String appId, String appSecret, String redirectUri) {
        ZaloOAuthClient client = new ZaloOAuthClient(new ObjectMapper());
        ReflectionTestUtils.setField(client, "zaloAppId", appId);
        ReflectionTestUtils.setField(client, "zaloAppSecret", appSecret);
        ReflectionTestUtils.setField(client, "zaloRedirectUri", redirectUri);
        return client;
    }
}
