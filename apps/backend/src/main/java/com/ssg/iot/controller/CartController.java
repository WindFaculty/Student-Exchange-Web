package com.ssg.iot.controller;

import com.ssg.iot.domain.User;
import com.ssg.iot.dto.cart.AddCartItemRequest;
import com.ssg.iot.dto.cart.CartResponse;
import com.ssg.iot.dto.cart.UpdateCartItemRequest;
import com.ssg.iot.service.CartService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public CartResponse getCart(HttpSession session) {
        return cartService.getCart(session);
    }

    @PostMapping("/items")
    public CartResponse addItem(@Valid @RequestBody AddCartItemRequest request, HttpSession session) {
        return cartService.addItem(session, request.getListingId(), request.getQuantity());
    }

    @PatchMapping("/items/{listingId}")
    public CartResponse updateItem(
            @PathVariable Long listingId,
            @Valid @RequestBody UpdateCartItemRequest request,
            HttpSession session
    ) {
        return cartService.updateItem(session, listingId, request.getQuantity());
    }

    @DeleteMapping("/items/{listingId}")
    public CartResponse removeItem(@PathVariable Long listingId, HttpSession session) {
        return cartService.removeItem(session, listingId);
    }
}
