package com.ssg.iot.service;

import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.domain.Listing;
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

    private final ListingService listingService;

    public record CartLine(Listing listing, int quantity) {
    }

    public CartResponse getCart(HttpSession session) {
        return buildCartResponse(getOrCreateCartMap(session));
    }

    public CartResponse addItem(HttpSession session, Long listingId, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Map<Long, Integer> cart = getOrCreateCartMap(session);
        Listing listing = listingService.getActiveListingEntity(listingId);

        int nextQuantity = cart.getOrDefault(listingId, 0) + quantity;
        if (nextQuantity > listing.getStock()) {
            throw new BadRequestException("Requested quantity exceeds stock");
        }

        cart.put(listingId, nextQuantity);
        session.setAttribute(CART_SESSION_KEY, cart);
        return buildCartResponse(cart);
    }

    public CartResponse updateItem(HttpSession session, Long listingId, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Map<Long, Integer> cart = getOrCreateCartMap(session);
        if (!cart.containsKey(listingId)) {
            throw new BadRequestException("Item not found in cart");
        }

        Listing listing = listingService.getActiveListingEntity(listingId);
        if (quantity > listing.getStock()) {
            throw new BadRequestException("Requested quantity exceeds stock");
        }

        cart.put(listingId, quantity);
        session.setAttribute(CART_SESSION_KEY, cart);
        return buildCartResponse(cart);
    }

    public CartResponse removeItem(HttpSession session, Long listingId) {
        Map<Long, Integer> cart = getOrCreateCartMap(session);
        cart.remove(listingId);
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
            Listing listing = listingService.getActiveListingEntity(entry.getKey());
            if (entry.getValue() > listing.getStock()) {
                throw new BadRequestException("Stock changed for listing: " + listing.getTitle());
            }
            return new CartLine(listing, entry.getValue());
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
            Listing listing = listingService.getActiveListingEntity(entry.getKey());
            int quantity = entry.getValue();
            BigDecimal subtotal = listing.getPrice().multiply(BigDecimal.valueOf(quantity));
            total = total.add(subtotal);

            items.add(CartItemResponse.builder()
                    .listingId(listing.getId())
                    .title(listing.getTitle())
                    .price(listing.getPrice())
                    .quantity(quantity)
                    .imageUrl(listing.getImageUrl())
                    .subtotal(subtotal)
                    .build());
        }

        return CartResponse.builder()
                .items(items)
                .totalAmount(total)
                .build();
    }
}
