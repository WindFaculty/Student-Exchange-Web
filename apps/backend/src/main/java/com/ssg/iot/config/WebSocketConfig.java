package com.ssg.iot.config;

import com.ssg.iot.service.SessionAuthService;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final String WS_USER_ID_ATTR = "WS_USER_ID";

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*")
                .addInterceptors(new SessionUserHandshakeInterceptor())
                .setHandshakeHandler(new SessionUserHandshakeHandler())
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/queue", "/topic");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    private static final class SessionUserHandshakeInterceptor implements HandshakeInterceptor {
        @Override
        public boolean beforeHandshake(
                @NonNull ServerHttpRequest request,
                @NonNull ServerHttpResponse response,
                @NonNull WebSocketHandler wsHandler,
                @NonNull Map<String, Object> attributes
        ) {
            if (!(request instanceof ServletServerHttpRequest servletRequest)) {
                return false;
            }

            var session = servletRequest.getServletRequest().getSession(false);
            if (session == null) {
                return false;
            }

            Object userId = session.getAttribute(SessionAuthService.SESSION_USER_ID);
            if (!(userId instanceof Number number)) {
                return false;
            }

            attributes.put(WS_USER_ID_ATTR, String.valueOf(number.longValue()));
            return true;
        }

        @Override
        public void afterHandshake(
                @NonNull ServerHttpRequest request,
                @NonNull ServerHttpResponse response,
                @NonNull WebSocketHandler wsHandler,
                Exception exception
        ) {
            // no-op
        }
    }

    private static final class SessionUserHandshakeHandler extends DefaultHandshakeHandler {
        @Override
        protected Principal determineUser(
                @NonNull ServerHttpRequest request,
                @NonNull WebSocketHandler wsHandler,
                @NonNull Map<String, Object> attributes
        ) {
            Object userId = attributes.get(WS_USER_ID_ATTR);
            if (userId == null) {
                return super.determineUser(request, wsHandler, attributes);
            }
            return () -> String.valueOf(userId);
        }
    }
}
