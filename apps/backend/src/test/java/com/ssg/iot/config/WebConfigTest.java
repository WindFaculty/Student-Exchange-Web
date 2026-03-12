package com.ssg.iot.config;

import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class WebConfigTest {

    @Test
    void resolveAllowedOriginPatternsIncludesDefaultsAndNormalizedFrontendOrigin() {
        WebConfig config = new WebConfig("https://www.chosinhvienfpt.id.vn/login?tab=1", "");

        Set<String> allowedOrigins = new LinkedHashSet<>(Arrays.asList(config.resolveAllowedOriginPatterns()));

        assertTrue(allowedOrigins.contains("http://localhost:*"));
        assertTrue(allowedOrigins.contains("http://127.0.0.1:*"));
        assertTrue(allowedOrigins.contains("https://chosinhvienfpt.id.vn"));
        assertTrue(allowedOrigins.contains("https://www.chosinhvienfpt.id.vn"));
        assertEquals(4, allowedOrigins.size());
    }

    @Test
    void resolveAllowedOriginPatternsAcceptsWrappedAndAdditionalConfiguredOrigins() {
        WebConfig config = new WebConfig(
                "<https://frontend.example.com/app>",
                " https://admin.example.com/dashboard, https://*.example.net, <https://preview.example.com/login> "
        );

        Set<String> allowedOrigins = new LinkedHashSet<>(Arrays.asList(config.resolveAllowedOriginPatterns()));

        assertTrue(allowedOrigins.contains("https://frontend.example.com"));
        assertTrue(allowedOrigins.contains("https://admin.example.com"));
        assertTrue(allowedOrigins.contains("https://*.example.net"));
        assertTrue(allowedOrigins.contains("https://preview.example.com"));
    }

    @Test
    void normalizeAllowedOriginPatternKeepsLiteralOriginWhenUrlParsingIsNotApplicable() {
        assertEquals("https://api.example.com:8443", WebConfig.normalizeAllowedOriginPattern("https://api.example.com:8443/path"));
        assertEquals("http://localhost:*", WebConfig.normalizeAllowedOriginPattern("http://localhost:*"));
    }
}
