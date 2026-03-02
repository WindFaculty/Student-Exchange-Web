package com.ssg.iot.repository;

import com.ssg.iot.domain.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderCode(String orderCode);
    Optional<Order> findByOrderCodeAndCustomerEmailIgnoreCase(String orderCode, String customerEmail);
    Page<Order> findByStatus_CodeIgnoreCase(String statusCode, Pageable pageable);
    Page<Order> findByUserId(Long userId, Pageable pageable);
    Page<Order> findByUserIsNullAndCustomerEmailIgnoreCase(String email, Pageable pageable);

    @Query("""
            SELECT o
            FROM Order o
            WHERE o.user.id = :userId
               OR (o.user IS NULL AND LOWER(o.customerEmail) = LOWER(:email))
            """)
    Page<Order> findMyOrdersCombined(@Param("userId") Long userId, @Param("email") String email, Pageable pageable);
}
