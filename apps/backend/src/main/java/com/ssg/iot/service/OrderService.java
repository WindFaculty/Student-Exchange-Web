package com.ssg.iot.service;

import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.common.NotFoundException;
import com.ssg.iot.common.PageResponse;
import com.ssg.iot.domain.*;
import com.ssg.iot.dto.order.CreateOrderRequest;
import com.ssg.iot.dto.order.OrderItemResponse;
import com.ssg.iot.dto.order.OrderResponse;
import com.ssg.iot.repository.ListingRepository;
import com.ssg.iot.repository.OrderRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final DateTimeFormatter ORDER_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final SecureRandom RANDOM = new SecureRandom();

    private final OrderRepository orderRepository;
    private final ListingRepository listingRepository;
    private final CartService cartService;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, HttpSession session, User currentUser) {
        List<CartService.CartLine> lines = cartService.getCartLines(session);
        if (lines.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Order order = new Order();
        order.setOrderCode(generateOrderCode());
        order.setCustomerName(request.getCustomerName().trim());
        order.setCustomerEmail(request.getCustomerEmail().trim().toLowerCase(Locale.ROOT));
        order.setCustomerAddress(request.getCustomerAddress().trim());
        order.setStatus(OrderStatus.PENDING);
        order.setUser(currentUser);

        BigDecimal total = BigDecimal.ZERO;

        for (CartService.CartLine line : lines) {
            Listing listing = line.listing();
            int quantity = line.quantity();

            if (listing.getStock() < quantity) {
                throw new BadRequestException("Insufficient stock for listing: " + listing.getTitle());
            }

            listing.setStock(listing.getStock() - quantity);

            BigDecimal subtotal = listing.getPrice().multiply(BigDecimal.valueOf(quantity));
            total = total.add(subtotal);

            OrderItem item = OrderItem.builder()
                    .listing(listing)
                    .listingTitle(listing.getTitle())
                    .unitPrice(listing.getPrice())
                    .quantity(quantity)
                    .subtotal(subtotal)
                    .build();
            order.addItem(item);
        }

        order.setTotalAmount(total);
        listingRepository.saveAll(lines.stream().map(CartService.CartLine::listing).collect(Collectors.toList()));

        Order saved = orderRepository.save(order);
        cartService.clearCart(session);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByCode(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse trackOrder(String orderCode, String email) {
        Order order = orderRepository.findByOrderCodeAndCustomerEmailIgnoreCase(orderCode, email)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAdminOrders(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage;

        if (status != null && !status.isBlank()) {
            OrderStatus parsedStatus = parseStatus(status);
            orderPage = orderRepository.findByStatus(parsedStatus, pageable);
        } else {
            orderPage = orderRepository.findAll(pageable);
        }

        Page<OrderResponse> mapped = orderPage.map(this::toResponse);
        return PageResponse.from(mapped);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        OrderStatus nextStatus = parseStatus(status);
        if (!isValidTransition(order.getStatus(), nextStatus)) {
            throw new BadRequestException("Invalid order status transition");
        }

        order.setStatus(nextStatus);
        return toResponse(orderRepository.save(order));
    }

    private OrderStatus parseStatus(String value) {
        try {
            return OrderStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new BadRequestException("Invalid order status: " + value);
        }
    }

    private boolean isValidTransition(OrderStatus current, OrderStatus next) {
        if (current == next) {
            return true;
        }

        if (current == OrderStatus.CANCELLED || current == OrderStatus.DELIVERED) {
            return false;
        }

        return switch (current) {
            case PENDING -> next == OrderStatus.CONFIRMED || next == OrderStatus.CANCELLED;
            case CONFIRMED -> next == OrderStatus.PROCESSING || next == OrderStatus.CANCELLED;
            case PROCESSING -> next == OrderStatus.SHIPPING || next == OrderStatus.CANCELLED;
            case SHIPPING -> next == OrderStatus.DELIVERED;
            default -> false;
        };
    }

    private String generateOrderCode() {
        String timePart = LocalDateTime.now().format(ORDER_TIME_FORMAT);
        int randomPart = 100 + RANDOM.nextInt(900);
        return "ORD" + timePart + randomPart;
    }

    public OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .listingId(item.getListing().getId())
                        .listingTitle(item.getListingTitle())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .customerName(order.getCustomerName())
                .customerEmail(order.getCustomerEmail())
                .customerAddress(order.getCustomerAddress())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .items(items)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
