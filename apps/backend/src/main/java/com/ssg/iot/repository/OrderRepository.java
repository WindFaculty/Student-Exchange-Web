package com.ssg.iot.repository;

import com.ssg.iot.domain.Order;
import com.ssg.iot.domain.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderCode(String orderCode);
    Optional<Order> findByOrderCodeAndCustomerEmailIgnoreCase(String orderCode, String customerEmail);
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
}
