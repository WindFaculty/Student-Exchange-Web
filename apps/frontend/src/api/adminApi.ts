import {
  Event,
  EventRegistration,
  EventRequest,
  IotContent,
  IotContentUpdateRequest,
  IotSampleProject,
  IotSampleProjectRequest,
  Listing,
  ListingRequest,
  Order,
  OrderStatus,
  PageResponse,
  SupportTicket,
  SupportTicketStatus,
} from '../types/models'
import { fetchJson } from './http'

export const adminApi = {
  getListings(params?: { search?: string; category?: string; active?: boolean; page?: number; size?: number }) {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.category) query.set('category', params.category)
    if (params?.active !== undefined) query.set('active', String(params.active))
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.size !== undefined) query.set('size', String(params.size))
    return fetchJson<PageResponse<Listing>>(`/api/admin/listings?${query.toString()}`)
  },

  getListing(id: number) {
    return fetchJson<Listing>(`/api/admin/listings/${id}`)
  },

  createListing(payload: ListingRequest) {
    return fetchJson<Listing>('/api/admin/listings', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  updateListing(id: number, payload: ListingRequest) {
    return fetchJson<Listing>(`/api/admin/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  deleteListing(id: number) {
    return fetchJson<void>(`/api/admin/listings/${id}`, { method: 'DELETE' })
  },

  getOrders(params?: { status?: OrderStatus | ''; page?: number; size?: number }) {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.size !== undefined) query.set('size', String(params.size))
    return fetchJson<PageResponse<Order>>(`/api/admin/orders?${query.toString()}`)
  },

  updateOrderStatus(id: number, status: OrderStatus) {
    return fetchJson<Order>(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  },

  getEvents(params?: { search?: string; active?: boolean; page?: number; size?: number }) {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.active !== undefined) query.set('active', String(params.active))
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.size !== undefined) query.set('size', String(params.size))
    return fetchJson<PageResponse<Event>>(`/api/admin/events?${query.toString()}`)
  },

  createEvent(payload: EventRequest) {
    return fetchJson<Event>('/api/admin/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  updateEvent(id: number, payload: EventRequest) {
    return fetchJson<Event>(`/api/admin/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  deleteEvent(id: number) {
    return fetchJson<void>(`/api/admin/events/${id}`, { method: 'DELETE' })
  },

  getEventRegistrations(id: number) {
    return fetchJson<EventRegistration[]>(`/api/admin/events/${id}/registrations`)
  },

  getSupportTickets(params?: { status?: SupportTicketStatus | ''; page?: number; size?: number }) {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.size !== undefined) query.set('size', String(params.size))
    return fetchJson<PageResponse<SupportTicket>>(`/api/admin/support/tickets?${query.toString()}`)
  },

  updateSupportTicketStatus(id: number, status: SupportTicketStatus) {
    return fetchJson<SupportTicket>(`/api/admin/support/tickets/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  },

  replySupportTicket(id: number, reply: string) {
    return fetchJson<SupportTicket>(`/api/admin/support/tickets/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ reply }),
    })
  },

  getIotContent() {
    return fetchJson<IotContent>('/api/admin/iot/content')
  },

  updateIotContent(payload: IotContentUpdateRequest) {
    return fetchJson<IotContent>('/api/admin/iot/content', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  getIotSampleProjects(params?: { search?: string; active?: boolean; page?: number; size?: number }) {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.active !== undefined) query.set('active', String(params.active))
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.size !== undefined) query.set('size', String(params.size))
    return fetchJson<PageResponse<IotSampleProject>>(`/api/admin/iot/sample-projects?${query.toString()}`)
  },

  getIotSampleProject(id: number) {
    return fetchJson<IotSampleProject>(`/api/admin/iot/sample-projects/${id}`)
  },

  createIotSampleProject(payload: IotSampleProjectRequest) {
    return fetchJson<IotSampleProject>('/api/admin/iot/sample-projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  updateIotSampleProject(id: number, payload: IotSampleProjectRequest) {
    return fetchJson<IotSampleProject>(`/api/admin/iot/sample-projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  deleteIotSampleProject(id: number) {
    return fetchJson<void>(`/api/admin/iot/sample-projects/${id}`, { method: 'DELETE' })
  },
}
