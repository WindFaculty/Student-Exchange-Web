package com.ssg.iot.service;

import com.ssg.iot.common.ForbiddenException;
import com.ssg.iot.common.UnauthorizedException;
import com.ssg.iot.domain.User;
import com.ssg.iot.domain.UserRole;
import com.ssg.iot.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SessionAuthService {
    public static final String SESSION_USER_ID = "USER_ID";
    public static final String SESSION_USER_ROLE = "USER_ROLE";

    private final UserRepository userRepository;

    public void login(HttpSession session, User user) {
        session.setAttribute(SESSION_USER_ID, user.getId());
        session.setAttribute(SESSION_USER_ROLE, user.getRole().name());
    }

    public void logout(HttpSession session) {
        session.invalidate();
    }

    public Optional<User> getCurrentUser(HttpSession session) {
        Object userIdRaw = session.getAttribute(SESSION_USER_ID);
        if (!(userIdRaw instanceof Number)) {
            return Optional.empty();
        }
        Long userId = ((Number) userIdRaw).longValue();
        return userRepository.findById(userId).filter(User::isActive);
    }

    public User requireUser(HttpSession session) {
        return getCurrentUser(session)
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
    }

    public User requireAdmin(HttpSession session) {
        User user = requireUser(session);
        if (user.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Admin access required");
        }
        return user;
    }
}
