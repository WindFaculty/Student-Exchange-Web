package com.ssg.iot.service;

import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.domain.RefVnProvince;
import com.ssg.iot.domain.RefVnWard;
import com.ssg.iot.domain.User;
import com.ssg.iot.domain.UserRole;
import com.ssg.iot.dto.auth.UpdateProfileRequest;
import com.ssg.iot.dto.auth.UserSessionResponse;
import com.ssg.iot.repository.RefVnProvinceRepository;
import com.ssg.iot.repository.RefVnWardRepository;
import com.ssg.iot.repository.UserRepository;
import com.ssg.iot.repository.UserSocialIdentityRepository;
import com.ssg.iot.service.location.VnLocationQueryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefVnProvinceRepository provinceRepository;

    @Mock
    private RefVnWardRepository wardRepository;

    @Mock
    private UserSocialIdentityRepository userSocialIdentityRepository;

    @Mock
    private ZaloOAuthGateway zaloOAuthGateway;

    private VnLocationQueryService locationQueryService;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        locationQueryService = new VnLocationQueryService(provinceRepository, wardRepository);
        authService = new AuthService(userRepository, userSocialIdentityRepository, locationQueryService, zaloOAuthGateway);
    }

    @Test
    void updateProfileNormalizesValuesAndReturnsUpdatedSession() {
        User currentUser = User.builder()
                .id(10L)
                .username("student1")
                .fullName("Old Name")
                .email("old@example.com")
                .role(UserRole.USER)
                .active(true)
                .build();

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("  Student Updated  ");
        request.setEmail("  Student1@Example.Com  ");
        request.setPhone("  0901234567  ");
        request.setAddress("  Thu Duc, HCMC  ");

        when(userRepository.existsByEmailIgnoreCaseAndIdNot("student1@example.com", 10L)).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserSessionResponse response = authService.updateProfile(currentUser, request);

        assertEquals("Student Updated", currentUser.getFullName());
        assertEquals("student1@example.com", currentUser.getEmail());
        assertEquals("0901234567", currentUser.getPhone());
        assertEquals("Thu Duc, HCMC", currentUser.getAddress());
        assertEquals("Student Updated", response.getFullName());
        assertEquals("student1@example.com", response.getEmail());
        assertEquals("0901234567", response.getPhone());
        assertEquals("Thu Duc, HCMC", response.getAddress());
        verify(userRepository).save(currentUser);
    }

    @Test
    void updateProfileThrowsWhenEmailIsAlreadyUsedByAnotherUser() {
        User currentUser = User.builder()
                .id(10L)
                .username("student1")
                .fullName("Student One")
                .email("student1@example.com")
                .role(UserRole.USER)
                .active(true)
                .build();

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("Student One");
        request.setEmail("taken@example.com");

        when(userRepository.existsByEmailIgnoreCaseAndIdNot("taken@example.com", 10L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.updateProfile(currentUser, request));
    }

    @Test
    void updateProfileAcceptsStructuredAddressAndBuildsLegacyAddressText() {
        User currentUser = User.builder()
                .id(10L)
                .username("student1")
                .fullName("Old Name")
                .email("old@example.com")
                .role(UserRole.USER)
                .active(true)
                .build();

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("Student Updated");
        request.setEmail("student1@example.com");
        request.setAddressLine("123 Le Loi");
        request.setProvinceCode("79");
        request.setWardCode("79001001");

        when(userRepository.existsByEmailIgnoreCaseAndIdNot("student1@example.com", 10L)).thenReturn(false);
        when(provinceRepository.findByCodeIgnoreCaseAndActiveTrue("79")).thenReturn(java.util.Optional.of(RefVnProvince.builder()
                .code("79")
                .nameCurrent("Ho Chi Minh")
                .active(true)
                .build()));
        when(wardRepository.findByCodeIgnoreCaseAndActiveTrue("79001001")).thenReturn(java.util.Optional.of(RefVnWard.builder()
                .code("79001001")
                .provinceCode("79")
                .nameCurrent("Linh Tay")
                .active(true)
                .build()));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserSessionResponse response = authService.updateProfile(currentUser, request);

        assertEquals("79", currentUser.getProvinceCode());
        assertEquals("79001001", currentUser.getWardCode());
        assertEquals("123 Le Loi", currentUser.getAddressLine());
        assertEquals("123 Le Loi, Linh Tay, Ho Chi Minh", currentUser.getAddress());
        assertEquals("123 Le Loi", response.getAddressLine());
        assertEquals("79", response.getProvinceCode());
        assertEquals("79001001", response.getWardCode());
        assertEquals("123 Le Loi, Linh Tay, Ho Chi Minh", response.getAddress());
    }

    @Test
    void updateProfileRejectsWardNotBelongingToProvince() {
        User currentUser = User.builder()
                .id(10L)
                .username("student1")
                .fullName("Old Name")
                .email("old@example.com")
                .role(UserRole.USER)
                .active(true)
                .build();

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("Student Updated");
        request.setEmail("student1@example.com");
        request.setAddressLine("123 Le Loi");
        request.setProvinceCode("79");
        request.setWardCode("48001001");

        when(userRepository.existsByEmailIgnoreCaseAndIdNot("student1@example.com", 10L)).thenReturn(false);
        when(provinceRepository.findByCodeIgnoreCaseAndActiveTrue("79")).thenReturn(java.util.Optional.of(RefVnProvince.builder()
                .code("79")
                .nameCurrent("Ho Chi Minh")
                .active(true)
                .build()));
        when(wardRepository.findByCodeIgnoreCaseAndActiveTrue("48001001")).thenReturn(java.util.Optional.of(RefVnWard.builder()
                .code("48001001")
                .provinceCode("48")
                .nameCurrent("Ward 48")
                .active(true)
                .build()));

        assertThrows(BadRequestException.class, () -> authService.updateProfile(currentUser, request));
    }
}
