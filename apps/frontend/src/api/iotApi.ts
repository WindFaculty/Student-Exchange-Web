import { IotOverviewResponse, IotSegment } from '../types/models'
import { fetchJson } from './http'

export const iotApi = {
  getOverview(params?: { search?: string; category?: string; segment?: IotSegment; page?: number; size?: number }) {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.category) query.set('category', params.category)
    if (params?.segment) query.set('segment', params.segment)
    if (params?.page !== undefined) query.set('page', String(params.page))
    if (params?.size !== undefined) query.set('size', String(params.size))

    return fetchJson<IotOverviewResponse>(`/api/iot/overview?${query.toString()}`)
  },
}
