package com.ssg.iot.controller;

import com.ssg.iot.common.PageResponse;
import com.ssg.iot.domain.User;
import com.ssg.iot.dto.chat.ChatConversationSummaryResponse;
import com.ssg.iot.dto.chat.ChatMessageResponse;
import com.ssg.iot.dto.chat.ChatUnreadCountResponse;
import com.ssg.iot.dto.chat.SendChatMessageRequest;
import com.ssg.iot.service.ChatService;
import com.ssg.iot.service.SessionAuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SessionAuthService sessionAuthService;

    @PostMapping("/contact/listings/{listingId}")
    public ChatConversationSummaryResponse contactListing(@PathVariable Long listingId, HttpSession session) {
        User user = sessionAuthService.requireUser(session);
        return chatService.contactListing(user, listingId);
    }

    @GetMapping("/conversations")
    public PageResponse<ChatConversationSummaryResponse> getMyConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        User user = sessionAuthService.requireUser(session);
        return chatService.listMyConversations(user, page, size);
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public PageResponse<ChatMessageResponse> getMyMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            HttpSession session
    ) {
        User user = sessionAuthService.requireUser(session);
        return chatService.listMessagesForUser(user, conversationId, page, size);
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ChatMessageResponse sendMessage(
            @PathVariable Long conversationId,
            @Valid @RequestBody SendChatMessageRequest request,
            HttpSession session
    ) {
        User user = sessionAuthService.requireUser(session);
        return chatService.sendMessage(user, conversationId, request.getContent());
    }

    @PostMapping("/conversations/{conversationId}/read")
    public ChatUnreadCountResponse markRead(@PathVariable Long conversationId, HttpSession session) {
        User user = sessionAuthService.requireUser(session);
        return chatService.markRead(user, conversationId);
    }

    @GetMapping("/unread-count")
    public ChatUnreadCountResponse unreadCount(HttpSession session) {
        User user = sessionAuthService.requireUser(session);
        return chatService.getUnreadCount(user);
    }
}
