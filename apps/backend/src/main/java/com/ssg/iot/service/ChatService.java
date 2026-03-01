package com.ssg.iot.service;

import com.ssg.iot.common.BadRequestException;
import com.ssg.iot.common.ForbiddenException;
import com.ssg.iot.common.NotFoundException;
import com.ssg.iot.common.PageResponse;
import com.ssg.iot.domain.ChatConversation;
import com.ssg.iot.domain.ChatMessage;
import com.ssg.iot.domain.Listing;
import com.ssg.iot.domain.User;
import com.ssg.iot.dto.chat.ChatConversationSummaryResponse;
import com.ssg.iot.dto.chat.ChatMessageResponse;
import com.ssg.iot.dto.chat.ChatSocketEventResponse;
import com.ssg.iot.dto.chat.ChatUnreadCountResponse;
import com.ssg.iot.repository.ChatConversationRepository;
import com.ssg.iot.repository.ChatMessageRepository;
import com.ssg.iot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    public static final String EVENT_MESSAGE_CREATED = "CHAT_MESSAGE_CREATED";
    public static final String EVENT_UNREAD_UPDATED = "CHAT_UNREAD_UPDATED";

    private final ChatConversationRepository chatConversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ListingService listingService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public ChatConversationSummaryResponse contactListing(User currentUser, Long listingId) {
        Listing listing = listingService.getActiveListingEntity(listingId);
        Long buyerId = currentUser.getId();
        Long sellerId = listing.getOwner().getId();

        if (buyerId.equals(sellerId)) {
            throw new BadRequestException("Cannot contact your own listing");
        }

        ChatConversation conversation = findOrCreateConversation(buyerId, sellerId);
        String autoMessage = "Toi quan tam san pham \"" + listing.getTitle() + "\" (listing #" + listing.getId() + ").";
        sendMessageInternal(conversation, buyerId, autoMessage, true);

        return toConversationSummary(conversation, buyerId);
    }

    @Transactional(readOnly = true)
    public PageResponse<ChatConversationSummaryResponse> listMyConversations(User currentUser, int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, "lastMessageAt").and(Sort.by(Sort.Direction.DESC, "updatedAt")));
        Page<ChatConversation> conversationPage = chatConversationRepository.findByUserAIdOrUserBId(
                currentUser.getId(),
                currentUser.getId(),
                pageable
        );

        List<ChatConversationSummaryResponse> summaries = conversationPage.getContent().stream()
                .map(conversation -> toConversationSummary(conversation, currentUser.getId()))
                .toList();

        return new PageResponse<>(
                summaries,
                conversationPage.getTotalElements(),
                conversationPage.getTotalPages(),
                conversationPage.getNumber(),
                conversationPage.getSize()
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<ChatMessageResponse> listMessagesForUser(User currentUser, Long conversationId, int page, int size) {
        ChatConversation conversation = getConversationOrThrow(conversationId);
        if (!conversation.includesUser(currentUser.getId())) {
            throw new ForbiddenException("Conversation access denied");
        }

        return listMessagesInternal(conversationId, page, size);
    }

    @Transactional(readOnly = true)
    public PageResponse<ChatMessageResponse> listMessagesForAdmin(Long conversationId, int page, int size) {
        getConversationOrThrow(conversationId);
        return listMessagesInternal(conversationId, page, size);
    }

    @Transactional
    public ChatMessageResponse sendMessage(User currentUser, Long conversationId, String content) {
        ChatConversation conversation = getConversationOrThrow(conversationId);
        if (!conversation.includesUser(currentUser.getId())) {
            throw new ForbiddenException("Conversation access denied");
        }

        String trimmedContent = trimToNull(content);
        if (trimmedContent == null) {
            throw new BadRequestException("Message content is required");
        }

        return sendMessageInternal(conversation, currentUser.getId(), trimmedContent, false);
    }

    @Transactional
    public ChatUnreadCountResponse markRead(User currentUser, Long conversationId) {
        ChatConversation conversation = getConversationOrThrow(conversationId);
        if (!conversation.includesUser(currentUser.getId())) {
            throw new ForbiddenException("Conversation access denied");
        }

        conversation.setUnreadForUser(currentUser.getId(), 0);
        chatConversationRepository.save(conversation);
        int unreadCount = getUnreadCount(currentUser).getUnreadCount();
        pushUnreadEvent(currentUser.getId(), unreadCount, conversation.getId());
        return new ChatUnreadCountResponse(unreadCount);
    }

    @Transactional(readOnly = true)
    public ChatUnreadCountResponse getUnreadCount(User currentUser) {
        long unread = chatConversationRepository.sumUnreadByUserId(currentUser.getId());
        return new ChatUnreadCountResponse((int) unread);
    }

    @Transactional(readOnly = true)
    public PageResponse<ChatConversationSummaryResponse> adminListConversations(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ChatConversation> conversationPage = chatConversationRepository.searchForAdmin(trimToNull(search), pageable);

        List<ChatConversationSummaryResponse> summaries = conversationPage.getContent().stream()
                .map(conversation -> toConversationSummary(conversation, null))
                .toList();

        return new PageResponse<>(
                summaries,
                conversationPage.getTotalElements(),
                conversationPage.getTotalPages(),
                conversationPage.getNumber(),
                conversationPage.getSize()
        );
    }

    private PageResponse<ChatMessageResponse> listMessagesInternal(Long conversationId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<ChatMessage> messagePage = chatMessageRepository.findByConversationId(conversationId, pageable);

        Set<Long> senderIds = messagePage.getContent().stream()
                .map(ChatMessage::getSenderId)
                .collect(Collectors.toSet());
        Map<Long, String> userNames = loadUserNames(senderIds);

        List<ChatMessageResponse> messages = messagePage.getContent().stream()
                .map(item -> toMessageResponse(item, userNames))
                .toList();

        return new PageResponse<>(
                messages,
                messagePage.getTotalElements(),
                messagePage.getTotalPages(),
                messagePage.getNumber(),
                messagePage.getSize()
        );
    }

    private ChatMessageResponse sendMessageInternal(ChatConversation conversation, Long senderId, String content, boolean autoGenerated) {
        if (!conversation.includesUser(senderId)) {
            throw new ForbiddenException("Conversation access denied");
        }

        Long recipientId = conversation.getOtherUserId(senderId);
        if (recipientId == null) {
            throw new BadRequestException("Invalid chat participant");
        }

        ChatMessage message = ChatMessage.builder()
                .conversation(conversation)
                .senderId(senderId)
                .content(content)
                .autoGenerated(autoGenerated)
                .build();
        ChatMessage savedMessage = chatMessageRepository.save(message);

        conversation.incrementUnreadForUser(recipientId);
        conversation.setLastMessageAt(LocalDateTime.now());
        chatConversationRepository.save(conversation);

        Map<Long, String> userNames = loadUserNames(Set.of(senderId, recipientId));
        ChatMessageResponse messageResponse = toMessageResponse(savedMessage, userNames);
        pushMessageEvent(conversation, messageResponse);
        pushUnreadEvent(senderId, (int) chatConversationRepository.sumUnreadByUserId(senderId), conversation.getId());
        pushUnreadEvent(recipientId, (int) chatConversationRepository.sumUnreadByUserId(recipientId), conversation.getId());
        return messageResponse;
    }

    private ChatConversation findOrCreateConversation(Long firstUserId, Long secondUserId) {
        Long userAId = Math.min(firstUserId, secondUserId);
        Long userBId = Math.max(firstUserId, secondUserId);

        return chatConversationRepository.findByUserAIdAndUserBId(userAId, userBId)
                .orElseGet(() -> chatConversationRepository.save(ChatConversation.builder()
                        .userAId(userAId)
                        .userBId(userBId)
                        .userAUnreadCount(0)
                        .userBUnreadCount(0)
                        .build()));
    }

    private ChatConversation getConversationOrThrow(Long conversationId) {
        return chatConversationRepository.findById(conversationId)
                .orElseThrow(() -> new NotFoundException("Conversation not found"));
    }

    private ChatConversationSummaryResponse toConversationSummary(ChatConversation conversation, Long viewerUserId) {
        Map<Long, String> userNames = loadUserNames(Set.of(conversation.getUserAId(), conversation.getUserBId()));
        String lastMessagePreview = chatMessageRepository.findFirstByConversationIdOrderByIdDesc(conversation.getId())
                .map(ChatMessage::getContent)
                .orElse(null);
        int unreadCount = viewerUserId == null ? 0 : conversation.getUnreadForUser(viewerUserId);

        return ChatConversationSummaryResponse.builder()
                .id(conversation.getId())
                .userAId(conversation.getUserAId())
                .userAName(userNames.getOrDefault(conversation.getUserAId(), "Unknown user"))
                .userBId(conversation.getUserBId())
                .userBName(userNames.getOrDefault(conversation.getUserBId(), "Unknown user"))
                .lastMessagePreview(lastMessagePreview)
                .lastMessageAt(conversation.getLastMessageAt())
                .unreadCount(unreadCount)
                .updatedAt(conversation.getUpdatedAt())
                .build();
    }

    private ChatMessageResponse toMessageResponse(ChatMessage message, Map<Long, String> userNames) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSenderId())
                .senderName(userNames.getOrDefault(message.getSenderId(), "Unknown user"))
                .content(message.getContent())
                .autoGenerated(message.isAutoGenerated())
                .createdAt(message.getCreatedAt())
                .build();
    }

    private Map<Long, String> loadUserNames(Set<Long> userIds) {
        if (userIds.isEmpty()) {
            return Map.of();
        }

        Map<Long, String> names = new HashMap<>();
        userRepository.findAllById(userIds).forEach(user -> {
            String displayName = trimToNull(user.getFullName());
            if (displayName == null) {
                displayName = user.getUsername();
            }
            names.put(user.getId(), displayName);
        });
        return names;
    }

    private void pushMessageEvent(ChatConversation conversation, ChatMessageResponse messageResponse) {
        ChatSocketEventResponse event = ChatSocketEventResponse.builder()
                .type(EVENT_MESSAGE_CREATED)
                .conversationId(conversation.getId())
                .message(messageResponse)
                .build();
        messagingTemplate.convertAndSendToUser(String.valueOf(conversation.getUserAId()), "/queue/chat-events", event);
        messagingTemplate.convertAndSendToUser(String.valueOf(conversation.getUserBId()), "/queue/chat-events", event);
    }

    private void pushUnreadEvent(Long userId, int unreadCount, Long conversationId) {
        ChatSocketEventResponse event = ChatSocketEventResponse.builder()
                .type(EVENT_UNREAD_UPDATED)
                .conversationId(conversationId)
                .unreadCount(unreadCount)
                .build();
        messagingTemplate.convertAndSendToUser(String.valueOf(userId), "/queue/chat-events", event);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
