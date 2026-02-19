import { fetchJson } from './http'
import { Listing, ListingRequest, PageResponse } from '../types/models'

export const listingApi = {
  getListings(params?: { search?: string; category?: string; page?: number; size?: number }) {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.category) query.set('category', params.category)
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.size !== undefined) query.set('size', String(params.size))

    return fetchJson<PageResponse<Listing>>(`/api/listings?${query.toString()}`)
  },

  getListing(id: number) {
    return fetchJson<Listing>(`/api/listings/${id}`)
  },

  createListing(payload: ListingRequest) {
    return fetchJson<Listing>('/api/listings', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  updateListing(id: number, payload: ListingRequest) {
    return fetchJson<Listing>(`/api/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  deleteListing(id: number) {
    return fetchJson<void>(`/api/listings/${id}`, { method: 'DELETE' })
  },

  getMyListings(params?: { page?: number; size?: number }) {
    const query = new URLSearchParams()
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.size !== undefined) query.set('size', String(params.size))
    return fetchJson<PageResponse<Listing>>(`/api/me/listings?${query.toString()}`)
  },
}
