import { fetchJson } from './http'
import {
  VnAddressSyncResult,
  VnAddressSyncStatus,
  VnDistrictOption,
  VnProvinceOption,
  VnWardOption,
} from '../types/models'

const buildQueryString = (params: Record<string, string | undefined>) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value)
  })
  return query.toString()
}

export const locationApi = {
  getProvinces(q?: string) {
    const query = buildQueryString({ q: q?.trim() || undefined })
    const suffix = query ? `?${query}` : ''
    return fetchJson<VnProvinceOption[]>(`/api/locations/vn/provinces${suffix}`)
  },

  getDistricts(provinceCode: string, q?: string) {
    const query = buildQueryString({ provinceCode, q: q?.trim() || undefined })
    return fetchJson<VnDistrictOption[]>(`/api/locations/vn/districts?${query}`)
  },

  getWards(districtCode: string, q?: string) {
    const query = buildQueryString({ districtCode, q: q?.trim() || undefined })
    return fetchJson<VnWardOption[]>(`/api/locations/vn/wards?${query}`)
  },

  getSyncStatus() {
    return fetchJson<VnAddressSyncStatus>('/api/admin/locations/vn/sync-status')
  },

  triggerSync() {
    return fetchJson<VnAddressSyncResult>('/api/admin/locations/vn/sync', {
      method: 'POST',
    })
  },
}

export function buildFullVnAddress(
  addressLine: string,
  wardName?: string,
  districtName?: string,
  provinceName?: string,
) {
  return [addressLine, wardName, districtName, provinceName]
    .map((item) => item?.trim() || '')
    .filter(Boolean)
    .join(', ')
}
