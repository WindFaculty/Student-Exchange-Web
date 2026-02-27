package com.ssg.iot.service;

import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.domain.CatalogItem;
import com.ssg.iot.dto.cart.CartItemResponse;
import com.ssg.iot.dto.cart.CartResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {
    private static final String CART_SESSION_KEY = "CART";

    private final CatalogItemService catalogItemService;

    public record CartLine(CatalogItem catalogItem, int quantity) {
    }

    public CartResponse getCart(HttpSession session) {
        return buildCartResponse(getOrCreateCartMap(session));
    }

    public CartResponse addItem(HttpSession session, Long catalogItemId, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Map<Long, Integer> cart = getOrCreateCartMap(session);
        CatalogItem catalogItem = catalogItemService.getActiveCatalogItem(catalogItemId);

        int nextQuantity = cart.getOrDefault(catalogItemId, 0) + quantity;
        if (nextQuantity > catalogItem.getStock()) {
            throw new BadRequestException("Requested quantity exceeds stock");
        }

        cart.put(catalogItemId, nextQuantity);
        session.setAttribute(CART_SESSION_KEY, cart);
        return buildCartResponse(cart);
    }

    public CartResponse updateItem(HttpSession session, Long catalogItemId, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Map<Long, Integer> cart = getOrCreateCartMap(session);
        if (!cart.containsKey(catalogItemId)) {
            throw new BadRequestException("Item not found in cart");
        }

        CatalogItem catalogItem = catalogItemService.getActiveCatalogItem(catalogItemId);
        if (quantity > catalogItem.getStock()) {
            throw new BadRequestException("Requested quantity exceeds stock");
        }

        cart.put(catalogItemId, quantity);
        session.setAttribute(CART_SESSION_KEY, cart);
        return buildCartResponse(cart);
    }

    public CartResponse removeItem(HttpSession session, Long catalogItemId) {
        Map<Long, Integer> cart = getOrCreateCartMap(session);
        cart.remove(catalogItemId);
        session.setAttribute(CART_SESSION_KEY, cart);
        return buildCartResponse(cart);
    }

    public void clearCart(HttpSession session) {
        session.removeAttribute(CART_SESSION_KEY);
    }

    public List<CartLine> getCartLines(HttpSession session) {
        Map<Long, Integer> cart = getOrCreateCartMap(session);
        if (cart.isEmpty()) {
            return Collections.emptyList();
        }

        return cart.entrySet().stream().map(entry -> {
            CatalogItem catalogItem = catalogItemService.getActiveCatalogItem(entry.getKey());
            if (entry.getValue() > catalogItem.getStock()) {
                throw new BadRequestException("Stock changed for item: " + catalogItem.getTitle());
            }
            return new CartLine(catalogItem, entry.getValue());
        }).collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    private Map<Long, Integer> getOrCreateCartMap(HttpSession session) {
        Object current = session.getAttribute(CART_SESSION_KEY);
        if (current instanceof Map<?, ?> map) {
            Map<Long, Integer> casted = new LinkedHashMap<>();
            map.forEach((key, value) -> {
                if (key instanceof Number keyNumber && value instanceof Number valueNumber) {
                    casted.put(keyNumber.longValue(), valueNumber.intValue());
                }
            });
            session.setAttribute(CART_SESSION_KEY, casted);
            return casted;
        }

        Map<Long, Integer> cart = new LinkedHashMap<>();
        session.setAttribute(CART_SESSION_KEY, cart);
        return cart;
    }

    private CartResponse buildCartResponse(Map<Long, Integer> cart) {
        List<CartItemResponse> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (Map.Entry<Long, Integer> entry : cart.entrySet()) {
            CatalogItem catalogItem = catalogItemService.getActiveCatalogItem(entry.getKey());
            int quantity = entry.getValue();
            BigDecimal subtotal = catalogItem.getPrice().multiply(BigDecimal.valueOf(quantity));
            total = total.add(subtotal);

            items.add(CartItemResponse.builder()
                    .catalogItemId(catalogItem.getId())
                    .sourceType(catalogItem.getSourceType())
                    .sourceRefId(catalogItem.getSourceRefId())
                    .title(catalogItem.getTitle())
                    .price(catalogItem.getPrice())
                    .quantity(quantity)
                    .imageUrl(catalogItem.getImageUrl())
                    .subtotal(subtotal)
                    .build());
        }

        return CartResponse.builder()
                .items(items)
                .totalAmount(total)
                .build();
    }
}
