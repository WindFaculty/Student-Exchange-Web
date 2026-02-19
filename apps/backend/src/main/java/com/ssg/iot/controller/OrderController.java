package com.ssg.iot.controller;

import com.ssg.iot.domain.User;
import com.ssg.iot.dto.order.CreateOrderRequest;
import com.ssg.iot.dto.order.OrderResponse;
import com.ssg.iot.service.OrderService;
import com.ssg.iot.service.SessionAuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final SessionAuthService sessionAuthService;

    @PostMapping
    public OrderResponse createOrder(@Valid @RequestBody CreateOrderRequest request, HttpSession session) {
        User currentUser = sessionAuthService.getCurrentUser(session).orElse(null);
        return orderService.createOrder(request, session, currentUser);
    }

    @GetMapping("/track")
    public OrderResponse trackOrder(@RequestParam String orderCode, @RequestParam String email) {
        return orderService.trackOrder(orderCode, email);
    }

    @GetMapping("/{orderCode}")
    public OrderResponse getOrderByCode(@PathVariable String orderCode) {
        return orderService.getOrderByCode(orderCode);
    }
}
