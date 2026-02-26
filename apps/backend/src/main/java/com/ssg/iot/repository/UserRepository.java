package com.ssg.iot.repository;

import com.ssg.iot.domain.User;
import com.ssg.iot.domain.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsernameAndActiveTrue(String username);
    Optional<User> findFirstByRoleAndActiveTrueOrderByIdAsc(UserRole role);
    boolean existsByUsernameIgnoreCase(String username);
    boolean existsByEmailIgnoreCase(String email);
    Optional<User> findByEmailIgnoreCase(String email);
}
