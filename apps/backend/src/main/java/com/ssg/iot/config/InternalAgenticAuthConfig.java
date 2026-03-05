package com.ssg.iot.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Set;

@Configuration
@Slf4j
public class InternalAgenticAuthConfig implements WebMvcConfigurer {

    private static final String INTERNAL_TOKEN_HEADER = "X-Internal-Token";
    private static final Set<String> LOCALHOST_ADDRESSES = Set.of(
            "127.0.0.1",
            "::1",
            "0:0:0:0:0:0:0:1"
    );

    @Value("${agentic.enabled:false}")
    private boolean agenticEnabled;

    @Value("${agentic.internal.token:}")
    private String internalToken;

    @Value("${agentic.internal.allow-localhost:true}")
    private boolean allowLocalhost;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new InternalAgenticTokenInterceptor())
                .addPathPatterns("/internal/agentic/**");
    }

    private class InternalAgenticTokenInterceptor implements HandlerInterceptor {
        @Override
        public boolean preHandle(
                HttpServletRequest request,
                HttpServletResponse response,
                Object handler
        ) throws Exception {
            if (!agenticEnabled) {
                response.sendError(HttpServletResponse.SC_SERVICE_UNAVAILABLE, "Agentic runtime is disabled");
                return false;
            }

            if (allowLocalhost && !LOCALHOST_ADDRESSES.contains(request.getRemoteAddr())) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Internal endpoint only accepts localhost traffic");
                return false;
            }

            if (internalToken == null || internalToken.isBlank()) {
                log.error("AGENTIC_INTERNAL_TOKEN is not configured");
                response.sendError(
                        HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                        "Internal token is not configured"
                );
                return false;
            }

            String providedToken = request.getHeader(INTERNAL_TOKEN_HEADER);
            if (!internalToken.equals(providedToken)) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid internal token");
                return false;
            }
            return true;
        }
    }
}
