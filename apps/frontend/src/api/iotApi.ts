import {
  IotItemResponse,
  IotOverviewResponse,
  IotSampleProject,
  IotSegment,
  PageResponse,
} from '../types/models'
import { fetchJson } from './http'

export const iotApi = {
  // Legacy endpoint, still used for hero content compatibility.
  getOverview(params?: { search?: string; category?: string; segment?: IotSegment; page?: number; size?: number }) {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.category) query.set('category', params.category)
    if (params?.segment) query.set('segment', params.segment)
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.size !== undefined) query.set('size', String(params.size))
    return fetchJson<IotOverviewResponse>(`/api/iot/overview?${query.toString()}`)
  },

  // Components from iot_components table.
  getComponents(params?: { search?: string; category?: string; page?: number; size?: number }) {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.category) query.set('category', params.category)
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.size !== undefined) query.set('size', String(params.size))
    return fetchJson<PageResponse<IotItemResponse>>(`/api/iot/components?${query.toString()}`)
  },

  // Legacy sample endpoint kept for backward compatibility.
  getSampleProducts(params?: { search?: string; page?: number; size?: number }) {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.size !== undefined) query.set('size', String(params.size))
    return fetchJson<PageResponse<IotItemResponse>>(`/api/iot/sample-products?${query.toString()}`)
  },

  // New project-centric endpoints.
  getSampleProjects(params?: { search?: string; page?: number; size?: number }) {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.size !== undefined) query.set('size', String(params.size))
    return fetchJson<PageResponse<IotSampleProject>>(`/api/iot/sample-projects?${query.toString()}`)
  },

  getSampleProjectBySlug(slug: string) {
    return fetchJson<IotSampleProject>(`/api/iot/sample-projects/${encodeURIComponent(slug)}`)
  },
}
