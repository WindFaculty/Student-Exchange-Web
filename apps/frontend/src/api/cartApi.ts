import { Cart } from '../types/models'
import { fetchJson } from './http'

export const cartApi = {
  getCart() {
    return fetchJson<Cart>('/api/cart')
  },

  addItem(catalogItemId: number, quantity: number) {
    return fetchJson<Cart>('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ catalogItemId, quantity }),
    })
  },

  updateItem(catalogItemId: number, quantity: number) {
    return fetchJson<Cart>(`/api/cart/items/${catalogItemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    })
  },

  removeItem(catalogItemId: number) {
    return fetchJson<Cart>(`/api/cart/items/${catalogItemId}`, {
      method: 'DELETE',
    })
  },
}
