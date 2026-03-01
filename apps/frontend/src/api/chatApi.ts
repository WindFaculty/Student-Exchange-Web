import { ChatConversationSummary, ChatMessage, ChatUnreadCount, PageResponse } from '../types/models'
import { fetchJson } from './http'

export const chatApi = {
  contactListing(listingId: number) {
    return fetchJson<ChatConversationSummary>(`/api/chats/contact/listings/${listingId}`, {
      method: 'POST',
    })
  },

  getConversations(params?: { page?: number; size?: number }) {
    const query = new URLSearchParams()
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.size !== undefined) query.set('size', String(params.size))
    return fetchJson<PageResponse<ChatConversationSummary>>(`/api/chats/conversations?${query.toString()}`)
  },

  getMessages(conversationId: number, params?: { page?: number; size?: number }) {
    const query = new URLSearchParams()
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.size !== undefined) query.set('size', String(params.size))
    return fetchJson<PageResponse<ChatMessage>>(`/api/chats/conversations/${conversationId}/messages?${query.toString()}`)
  },

  sendMessage(conversationId: number, content: string) {
    return fetchJson<ChatMessage>(`/api/chats/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  },

  markRead(conversationId: number) {
    return fetchJson<ChatUnreadCount>(`/api/chats/conversations/${conversationId}/read`, {
      method: 'POST',
    })
  },

  getUnreadCount() {
    return fetchJson<ChatUnreadCount>('/api/chats/unread-count')
  },
}
