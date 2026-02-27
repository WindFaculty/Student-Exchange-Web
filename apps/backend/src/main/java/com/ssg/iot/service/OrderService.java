package com.ssg.iot.service;

import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.common.NotFoundException;
import com.ssg.iot.common.PageResponse;
import com.ssg.iot.domain.*;
import com.ssg.iot.dto.order.CreateOrderRequest;
import com.ssg.iot.dto.order.OrderItemResponse;
import com.ssg.iot.dto.order.OrderResponse;
import com.ssg.iot.repository.IotComponentRepository;
import com.ssg.iot.repository.IotSampleProductRepository;
import com.ssg.iot.repository.ListingRepository;
import com.ssg.iot.repository.OrderRepository;
import com.ssg.iot.repository.RefOrderStatusRepository;
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
    private final IotComponentRepository iotComponentRepository;
    private final IotSampleProductRepository iotSampleProductRepository;
    private final RefOrderStatusRepository orderStatusRepository;
    private final CartService cartService;
    private final CatalogItemService catalogItemService;

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
        order.setStatus(getStatusOrThrow("PENDING"));
        order.setUser(currentUser);

        BigDecimal total = BigDecimal.ZERO;

        for (CartService.CartLine line : lines) {
            CatalogItem catalogItem = line.catalogItem();
            int quantity = line.quantity();

            if (catalogItem.getStock() < quantity) {
                throw new BadRequestException("Insufficient stock for item: " + catalogItem.getTitle());
            }

            int nextStock = catalogItem.getStock() - quantity;
            applySourceStock(catalogItem, nextStock);
            catalogItemService.updateStock(catalogItem, nextStock);

            BigDecimal subtotal = catalogItem.getPrice().multiply(BigDecimal.valueOf(quantity));
            total = total.add(subtotal);

            OrderItem item = OrderItem.builder()
                    .catalogItem(catalogItem)
                    .sourceType(catalogItem.getSourceType())
                    .sourceRefId(catalogItem.getSourceRefId())
                    .itemTitle(catalogItem.getTitle())
                    .unitPrice(catalogItem.getPrice())
                    .quantity(quantity)
                    .subtotal(subtotal)
                    .build();
            order.addItem(item);
        }

        order.setTotalAmount(total);
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
            String parsedStatus = parseStatusCode(status);
            orderPage = orderRepository.findByStatus_CodeIgnoreCase(parsedStatus, pageable);
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

        String nextStatus = parseStatusCode(status);
        if (!isValidTransition(order.getStatus().getCode(), nextStatus)) {
            throw new BadRequestException("Invalid order status transition");
        }

        order.setStatus(getStatusOrThrow(nextStatus));
        return toResponse(orderRepository.save(order));
    }

    private String parseStatusCode(String value) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("status is required");
        }

        String code = value.trim().toUpperCase(Locale.ROOT);
        if (orderStatusRepository.findByCodeIgnoreCaseAndActiveTrue(code).isEmpty()) {
            throw new BadRequestException("Invalid order status: " + value);
        }
        return code;
    }

    private boolean isValidTransition(String current, String next) {
        if (current.equals(next)) {
            return true;
        }

        if (current.equals("CANCELLED") || current.equals("DELIVERED")) {
            return false;
        }

        return switch (current) {
            case "PENDING" -> next.equals("CONFIRMED") || next.equals("CANCELLED");
            case "CONFIRMED" -> next.equals("PROCESSING") || next.equals("CANCELLED");
            case "PROCESSING" -> next.equals("SHIPPING") || next.equals("CANCELLED");
            case "SHIPPING" -> next.equals("DELIVERED");
            default -> false;
        };
    }

    private RefOrderStatus getStatusOrThrow(String code) {
        return orderStatusRepository.findByCodeIgnoreCaseAndActiveTrue(code)
                .orElseThrow(() -> new NotFoundException("Order status not found: " + code));
    }

    private void applySourceStock(CatalogItem catalogItem, int nextStock) {
        if (catalogItem.getSourceType() == CatalogSourceType.LISTING) {
            Listing listing = listingRepository.findById(catalogItem.getSourceRefId())
                    .orElseThrow(() -> new NotFoundException("Listing not found"));
            listing.setStock(nextStock);
            listingRepository.save(listing);
            return;
        }

        if (catalogItem.getSourceType() == CatalogSourceType.IOT_COMPONENT) {
            IotComponent component = iotComponentRepository.findById(catalogItem.getSourceRefId())
                    .orElseThrow(() -> new NotFoundException("IoT component not found"));
            component.setStock(nextStock);
            iotComponentRepository.save(component);
            return;
        }

        if (catalogItem.getSourceType() == CatalogSourceType.IOT_SAMPLE) {
            IotSampleProduct sample = iotSampleProductRepository.findById(catalogItem.getSourceRefId())
                    .orElseThrow(() -> new NotFoundException("IoT sample not found"));
            sample.setStock(nextStock);
            iotSampleProductRepository.save(sample);
            return;
        }

        throw new BadRequestException("Unsupported source type");
    }

    private String generateOrderCode() {
        String timePart = LocalDateTime.now().format(ORDER_TIME_FORMAT);
        int randomPart = 100 + RANDOM.nextInt(900);
        return "ORD" + timePart + randomPart;
    }

    public OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .catalogItemId(item.getCatalogItem().getId())
                        .sourceType(item.getSourceType())
                        .sourceRefId(item.getSourceRefId())
                        .title(item.getItemTitle())
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
                .status(order.getStatus().getCode())
                .totalAmount(order.getTotalAmount())
                .items(items)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
