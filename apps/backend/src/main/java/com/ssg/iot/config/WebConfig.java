package com.ssg.iot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.net.URI;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final String[] DEFAULT_ALLOWED_ORIGIN_PATTERNS = {
            "http://localhost:*",
            "http://127.0.0.1:*",
            "https://chosinhvienfpt.id.vn",
            "https://www.chosinhvienfpt.id.vn"
    };

    private final String frontendBaseUrl;
    private final String allowedOriginPatterns;

    public WebConfig(
            @Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl,
            @Value("${app.cors.allowed-origin-patterns:}") String allowedOriginPatterns
    ) {
        this.frontendBaseUrl = frontendBaseUrl;
        this.allowedOriginPatterns = allowedOriginPatterns;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(resolveAllowedOriginPatterns())
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    String[] resolveAllowedOriginPatterns() {
        Set<String> patterns = new LinkedHashSet<>(Arrays.asList(DEFAULT_ALLOWED_ORIGIN_PATTERNS));
        addAllowedOriginPattern(patterns, frontendBaseUrl);

        for (String pattern : allowedOriginPatterns.split(",")) {
            addAllowedOriginPattern(patterns, pattern);
        }

        return patterns.toArray(String[]::new);
    }

    private void addAllowedOriginPattern(Set<String> patterns, String rawValue) {
        String normalizedValue = normalizeAllowedOriginPattern(rawValue);
        if (normalizedValue != null) {
            patterns.add(normalizedValue);
        }
    }

    static String normalizeAllowedOriginPattern(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        if (normalized.length() > 1 && normalized.startsWith("<") && normalized.endsWith(">")) {
            normalized = normalized.substring(1, normalized.length() - 1).trim();
        }
        if (normalized.isEmpty()) {
            return null;
        }
        if (normalized.contains("*")) {
            return normalized.toLowerCase(Locale.ROOT);
        }

        try {
            URI uri = URI.create(normalized);
            if (uri.getScheme() == null || uri.getHost() == null) {
                return normalized;
            }

            String scheme = uri.getScheme().toLowerCase(Locale.ROOT);
            String host = uri.getHost().toLowerCase(Locale.ROOT);
            int port = uri.getPort();
            return port >= 0 ? scheme + "://" + host + ":" + port : scheme + "://" + host;
        } catch (IllegalArgumentException ex) {
            return normalized;
        }
    }
}
