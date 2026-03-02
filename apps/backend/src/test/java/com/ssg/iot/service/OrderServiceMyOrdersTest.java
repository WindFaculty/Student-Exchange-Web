package com.ssg.iot.service;

import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.common.PageResponse;
import com.ssg.iot.domain.Order;
import com.ssg.iot.domain.User;
import com.ssg.iot.domain.UserRole;
import com.ssg.iot.dto.order.OrderResponse;
import com.ssg.iot.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OrderServiceMyOrdersTest {

    private OrderRepository orderRepository;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderRepository = mock(OrderRepository.class);
        orderService = new OrderService(orderRepository, null, null, null, null, null);
    }

    @Test
    void getMyOrdersUsesAccountScopeQuery() {
        User user = buildUser();
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> emptyPage = new PageImpl<>(List.of(), pageable, 0);
        when(orderRepository.findByUserId(99L, pageable)).thenReturn(emptyPage);

        PageResponse<OrderResponse> response = orderService.getMyOrders(user, "ACCOUNT", 0, 10);

        assertTrue(response.getContent().isEmpty());
        verify(orderRepository).findByUserId(99L, pageable);
    }

    @Test
    void getMyOrdersUsesEmailScopeQueryForGuestOrders() {
        User user = buildUser();
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> emptyPage = new PageImpl<>(List.of(), pageable, 0);
        when(orderRepository.findByUserIsNullAndCustomerEmailIgnoreCase("student1@example.com", pageable)).thenReturn(emptyPage);

        PageResponse<OrderResponse> response = orderService.getMyOrders(user, "EMAIL", 0, 10);

        assertTrue(response.getContent().isEmpty());
        verify(orderRepository).findByUserIsNullAndCustomerEmailIgnoreCase("student1@example.com", pageable);
    }

    @Test
    void getMyOrdersUsesCombinedScopeByDefault() {
        User user = buildUser();
        when(orderRepository.findMyOrdersCombined(eq(99L), eq("student1@example.com"), any(Pageable.class)))
                .thenReturn(Page.<Order>empty());

        PageResponse<OrderResponse> response = orderService.getMyOrders(user, "", 0, 10);

        assertTrue(response.getContent().isEmpty());
        verify(orderRepository).findMyOrdersCombined(eq(99L), eq("student1@example.com"), any(Pageable.class));
    }

    @Test
    void getMyOrdersThrowsForInvalidScope() {
        User user = buildUser();
        assertThrows(BadRequestException.class, () -> orderService.getMyOrders(user, "INVALID_SCOPE", 0, 10));
    }

    private User buildUser() {
        return User.builder()
                .id(99L)
                .username("student1")
                .fullName("Student User")
                .email("student1@example.com")
                .role(UserRole.USER)
                .active(true)
                .build();
    }
}
