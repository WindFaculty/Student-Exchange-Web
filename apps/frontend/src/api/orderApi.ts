import { Order } from '../types/models'
import { fetchJson } from './http'

export interface CreateOrderPayload {
  customerName: string
  customerEmail: string
  customerAddress: string
}

export const orderApi = {
  createOrder(payload: CreateOrderPayload) {
    return fetchJson<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  getOrder(orderCode: string) {
    return fetchJson<Order>(`/api/orders/${orderCode}`)
  },

  trackOrder(orderCode: string, email: string) {
    const query = new URLSearchParams({ orderCode, email })
    return fetchJson<Order>(`/api/orders/track?${query.toString()}`)
  },
}
