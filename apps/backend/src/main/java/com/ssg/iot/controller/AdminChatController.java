package com.ssg.iot.controller;

import com.ssg.iot.common.PageResponse;
import com.ssg.iot.dto.chat.ChatConversationSummaryResponse;
import com.ssg.iot.dto.chat.ChatMessageResponse;
import com.ssg.iot.service.ChatService;
import com.ssg.iot.service.SessionAuthService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/chats")
@RequiredArgsConstructor
public class AdminChatController {

    private final SessionAuthService sessionAuthService;
    private final ChatService chatService;

    @GetMapping("/conversations")
    public PageResponse<ChatConversationSummaryResponse> getConversations(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        sessionAuthService.requireAdmin(session);
        return chatService.adminListConversations(search, page, size);
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public PageResponse<ChatMessageResponse> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            HttpSession session
    ) {
        sessionAuthService.requireAdmin(session);
        return chatService.listMessagesForAdmin(conversationId, page, size);
    }
}
