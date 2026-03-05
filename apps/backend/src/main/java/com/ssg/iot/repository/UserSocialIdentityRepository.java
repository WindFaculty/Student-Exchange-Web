package com.ssg.iot.repository;

import com.ssg.iot.domain.UserSocialIdentity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserSocialIdentityRepository extends JpaRepository<UserSocialIdentity, Long> {
    Optional<UserSocialIdentity> findByProviderAndProviderUserId(String provider, String providerUserId);
    Optional<UserSocialIdentity> findByUserIdAndProvider(Long userId, String provider);
    boolean existsByUserIdAndProvider(Long userId, String provider);
}
