import { MyOrderScope, Order, PageResponse } from '../types/models'
import { fetchJson } from './http'

export interface CreateOrderPayload {
  customerName: string
  customerEmail?: string
  customerAddress: string
  customerPhone: string
}

export interface GetMyOrdersParams {
  scope?: MyOrderScope
  page?: number
  size?: number
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

  getMyOrders(params?: GetMyOrdersParams) {
    const query = new URLSearchParams()
    if (params?.scope) query.set('scope', params.scope)
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.size !== undefined) query.set('size', String(params.size))
    return fetchJson<PageResponse<Order>>(`/api/me/orders?${query.toString()}`)
  },
}
