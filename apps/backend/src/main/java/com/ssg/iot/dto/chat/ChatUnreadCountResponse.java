package com.ssg.iot.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatUnreadCountResponse {
    private int unreadCount;
}
