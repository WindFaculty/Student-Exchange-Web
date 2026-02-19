import { Cart } from '../types/models'
import { fetchJson } from './http'

export const cartApi = {
  getCart() {
    return fetchJson<Cart>('/api/cart')
  },

  addItem(listingId: number, quantity: number) {
    return fetchJson<Cart>('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ listingId, quantity }),
    })
  },

  updateItem(listingId: number, quantity: number) {
    return fetchJson<Cart>(`/api/cart/items/${listingId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    })
  },

  removeItem(listingId: number) {
    return fetchJson<Cart>(`/api/cart/items/${listingId}`, {
      method: 'DELETE',
    })
  },
}
