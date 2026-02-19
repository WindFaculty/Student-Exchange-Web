import { Event, EventRegistration, EventRequest, PageResponse } from '../types/models'
import { fetchJson } from './http'

export interface EventRegistrationPayload {
  name: string
  email: string
  phone?: string
  note?: string
}

export const eventApi = {
  getEvents(params?: { search?: string; page?: number; size?: number }) {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.size !== undefined) query.set('size', String(params.size))

    return fetchJson<PageResponse<Event>>(`/api/events?${query.toString()}`)
  },

  getEvent(id: number) {
    return fetchJson<Event>(`/api/events/${id}`)
  },

  registerEvent(eventId: number, payload: EventRegistrationPayload) {
    return fetchJson<EventRegistration>(`/api/events/${eventId}/registrations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  getMyRegistrations() {
    return fetchJson<EventRegistration[]>('/api/me/event-registrations')
  },
}

export type { EventRequest }
