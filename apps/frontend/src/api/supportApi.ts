import { FAQItem, PageResponse, SupportTicket, SupportTicketStatus } from '../types/models'
import { fetchJson } from './http'

export interface CreateSupportTicketPayload {
  name: string
  email: string
  subject: string
  category: string
  message: string
}

export const supportApi = {
  getFaqs(params?: { category?: string; search?: string }) {
    const query = new URLSearchParams()
    if (params?.category) query.set('category', params.category)
    if (params?.search) query.set('search', params.search)
    return fetchJson<FAQItem[]>(`/api/faqs?${query.toString()}`)
  },

  createTicket(payload: CreateSupportTicketPayload) {
    return fetchJson<SupportTicket>('/api/support/tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  trackTicket(ticketCode: string, email: string) {
    const query = new URLSearchParams({ ticketCode, email })
    return fetchJson<SupportTicket>(`/api/support/tickets/track?${query.toString()}`)
  },

  getAdminTickets(params?: { status?: SupportTicketStatus | ''; page?: number; size?: number }) {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.size !== undefined) query.set('size', String(params.size))
    return fetchJson<PageResponse<SupportTicket>>(`/api/admin/support/tickets?${query.toString()}`)
  },

  updateTicketStatus(id: number, status: SupportTicketStatus) {
    return fetchJson<SupportTicket>(`/api/admin/support/tickets/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  },

  replyTicket(id: number, reply: string) {
    return fetchJson<SupportTicket>(`/api/admin/support/tickets/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ reply }),
    })
  },
}
