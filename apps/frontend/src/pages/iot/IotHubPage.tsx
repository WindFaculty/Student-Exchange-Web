import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { iotApi } from '../../api/iotApi'
import { useCart } from '../../context/CartContext'
import { formatCurrency, mapApiError } from '../../lib/format'
import { IOT_COMPONENT_CLASSIFICATION } from '../../lib/listingCategories'
import Icon from '../../components/ui/Icon'
import { IotItemResponse, IotSampleProject, PageResponse } from '../../types/models'

type IotTabKey = 'components' | 'sample' | 'services'

type IotCardItem = {
  id: number
  title: string
  description?: string
  price: number
  stock: number
  imageUrl?: string
  catalogItemId?: number
  purchasable?: boolean
  slug?: string
}

const DEFAULT_TAB: IotTabKey = 'components'
const TAB_ORDER: IotTabKey[] = ['components', 'sample', 'services']

const TAB_CONFIG: Record<IotTabKey, { label: string; subtitle: string; icon: string }> = {
  components: {
    label: 'Linh kiện',
    subtitle: 'Danh mục linh kiện IoT cho học tập và dự án.',
    icon: 'memory',
  },
  sample: {
    label: 'Sản phẩm mẫu',
    subtitle: '8 dự án mẫu để tham khảo và triển khai nhanh.',
    icon: 'groups',
  },
  services: {
    label: 'Dịch vụ',
    subtitle: 'Các dịch vụ hỗ trợ tư vấn, lắp đặt và bảo trì.',
    icon: 'rocket_launch',
  },
}

const SERVICE_CATEGORIES = [
  {
    key: 'pcb',
    label: 'Đặt in mạch',
    icon: 'developer_board',
    description: 'Dịch vụ thiết kế và in mạch PCB theo yêu cầu.',
  },
  {
    key: 'rental',
    label: 'Thuê linh kiện',
    icon: 'handshake',
    description: 'Thuê linh kiện điện tử theo ngày/tuần cho dự án.',
  },
  {
    key: 'consult',
    label: 'Tư vấn',
    icon: 'support_agent',
    description: 'Tư vấn kỹ thuật, lắp đặt và triển khai hệ thống IoT.',
  },
] as const

const normalizeTab = (rawTab: string | null): IotTabKey => {
  if (rawTab === 'sample' || rawTab === 'services' || rawTab === 'components') {
    return rawTab
  }
  return DEFAULT_TAB
}

const toCardFromComponent = (item: IotItemResponse): IotCardItem => ({
  id: item.id,
  title: item.title,
  description: item.description,
  price: item.price,
  stock: item.stock,
  imageUrl: item.imageUrl,
  catalogItemId: item.catalogItemId,
  purchasable: item.purchasable ?? true,
})

const toCardFromSample = (item: IotSampleProject): IotCardItem => ({
  id: item.id,
  title: item.title,
  description: item.summary || item.description,
  price: item.price,
  stock: item.stock,
  imageUrl: item.imageUrl,
  catalogItemId: item.catalogItemId,
  purchasable: item.purchasable,
  slug: item.slug,
})

const IotHubPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { addToCart } = useCart()

  const [data, setData] = useState<PageResponse<IotCardItem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addingId, setAddingId] = useState<number | null>(null)

  const rawTab = searchParams.get('tab')
  const tab = normalizeTab(rawTab)
  const pageRaw = Number(searchParams.get('page') ?? 0)
  const page = Number.isFinite(pageRaw) && pageRaw >= 0 ? pageRaw : 0
  const search = searchParams.get('search') ?? ''
  const selectedComponentCategory = tab === 'components' ? searchParams.get('categoryCode') ?? '' : ''

  useEffect(() => {
    if (rawTab === null || rawTab === tab) return
    const next = new URLSearchParams(searchParams)
    next.set('tab', tab)
    next.set('page', '0')
    setSearchParams(next, { replace: true })
  }, [rawTab, searchParams, setSearchParams, tab])

  useEffect(() => {
    if (tab === 'services') {
      setData(null)
      setLoading(false)
      setError('')
      return
    }

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        if (tab === 'components') {
          const result = await iotApi.getComponents({
            search: search || undefined,
            categoryCode: selectedComponentCategory || undefined,
            page,
            size: 12,
          })
          setData({
            ...result,
            content: result.content.map(toCardFromComponent),
          })
        } else {
          const result = await iotApi.getSampleProjects({
            search: search || undefined,
            page,
            size: 12,
          })
          setData({
            ...result,
            content: result.content.map(toCardFromSample),
          })
        }
      } catch (err: unknown) {
        setError(mapApiError(err, 'Không thể tải dữ liệu IoT'))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [search, selectedComponentCategory, tab, page])

  const listings = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const updateQuery = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) next.delete(key)
      else next.set(key, value)
    })
    if (!next.get('tab')) next.set('tab', DEFAULT_TAB)
    if (!('page' in updates)) next.set('page', '0')
    setSearchParams(next)
  }

  const handleAddToCart = async (catalogItemId?: number) => {
    if (!catalogItemId) {
      setError('Dự án này chưa map với sản phẩm để mua hàng')
      return
    }
    setAddingId(catalogItemId)
    try {
      await addToCart(catalogItemId, 1)
    } catch (err: unknown) {
      setError(mapApiError(err, 'Không thể thêm vào giỏ hàng'))
    } finally {
      setAddingId(null)
    }
  }

  const openDetail = (item: IotCardItem) => {
    if (tab === 'sample' && item.slug) {
      navigate(`/iot/projects/${item.slug}`)
      return
    }

    setError('Chi tiết cho linh kiện sẽ được bổ sung trong cập nhật sau')
  }

  return (
    <div className="min-h-screen bg-[#0b1a2e] px-4 py-8 text-white">
      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        {TAB_ORDER.map((item) => {
          const cfg = TAB_CONFIG[item]
          const active = item === tab
          return (
            <button
              key={item}
              type="button"
              onClick={() => updateQuery({ tab: item, page: '0', categoryCode: '', search: '' })}
              className={[
                'group relative flex flex-col items-center gap-3 rounded-2xl border p-6 text-center transition-all duration-200',
                active
                  ? 'border-blue-500/60 bg-[#0d2e5a]/80 shadow-[0_0_24px_4px_rgba(59,130,246,0.25)]'
                  : 'border-blue-900/40 bg-[#0d1f3c]/60 hover:border-blue-600/50 hover:bg-[#0d2a52]/70',
              ].join(' ')}
            >
              <div
                className={[
                  'flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300',
                  active
                    ? 'bg-blue-500/20 ring-2 ring-blue-400/50 shadow-[0_0_16px_4px_rgba(59,130,246,0.4)]'
                    : 'bg-blue-900/30 group-hover:bg-blue-800/40',
                ].join(' ')}
              >
                <span
                  className={[
                    'material-symbols-outlined text-4xl transition-colors',
                    active ? 'text-blue-300' : 'text-blue-500 group-hover:text-blue-400',
                  ].join(' ')}
                >
                  {cfg.icon}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">{cfg.label}</h2>
              <p className="text-sm leading-snug text-slate-400">{cfg.subtitle}</p>
            </button>
          )
        })}
      </section>

      {tab === 'services' && (
        <section className="grid gap-6 sm:grid-cols-3">
          {SERVICE_CATEGORIES.map((svc) => (
            <div
              key={svc.key}
              className="flex flex-col items-center gap-4 rounded-2xl border border-cyan-900/40 bg-[#0a2535]/70 p-8 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/15 ring-2 ring-cyan-400/40 shadow-[0_0_16px_4px_rgba(6,182,212,0.3)]">
                <span className="material-symbols-outlined text-4xl text-cyan-300">{svc.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-white">{svc.label}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{svc.description}</p>
            </div>
          ))}
        </section>
      )}

      {tab !== 'services' && (
        <>
          <section className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => updateQuery({ search: e.target.value, page: '0' })}
                placeholder="Tìm theo tiêu đề hoặc mô tả"
                className="h-11 w-full rounded-xl border border-blue-900/50 bg-[#0d1f3c]/80 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {tab === 'components' && (
              <div className="relative shrink-0">
                <select
                  value={selectedComponentCategory}
                  onChange={(e) => updateQuery({ categoryCode: e.target.value, page: '0' })}
                  className="h-11 cursor-pointer appearance-none rounded-xl border border-blue-900/50 bg-[#0d1f3c]/80 px-4 pr-10 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="" className="bg-[#0d1f3c]">Tất cả nhóm linh kiện</option>
                  {IOT_COMPONENT_CLASSIFICATION.map((group) => (
                    <option key={group.code} value={group.code} className="bg-[#0d1f3c]">
                      {group.category}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
                  expand_more
                </span>
              </div>
            )}
          </section>

          {error ? (
            <p className="mb-4 rounded-xl border border-red-700/40 bg-red-900/20 px-4 py-3 text-sm text-red-400">{error}</p>
          ) : null}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : !error && listings.length === 0 ? (
            <p className="rounded-xl border border-dashed border-blue-900/50 bg-[#0d1f3c]/40 px-4 py-8 text-center text-sm text-slate-400">
              Chưa có sản phẩm IoT phù hợp với bộ lọc.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((item) => {
                const catalogItemId = item.catalogItemId
                const canBuy = (tab !== 'sample' || item.purchasable) && !!catalogItemId && item.stock > 0
                return (
                  <div
                    key={`${tab}-${item.id}`}
                    className="group overflow-hidden rounded-2xl border border-blue-900/40 bg-[#0d1f3c]/70 transition-all duration-200 hover:border-blue-600/50 hover:shadow-[0_0_16px_4px_rgba(59,130,246,0.15)]"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-[#091528]">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Icon name="devices_other" className="text-4xl text-blue-900" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 p-4">
                      <h3 className="line-clamp-2 text-base font-semibold text-white">{item.title}</h3>
                      <p className="line-clamp-2 text-sm text-slate-400">{item.description}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-lg font-bold text-white">{formatCurrency(item.price)}</span>
                        <span className="text-xs text-slate-400">Tồn kho: {item.stock}</span>
                      </div>

                      {tab === 'sample' && !item.purchasable ? (
                        <p className="text-xs text-amber-300">Dự án này chỉ để tham khảo (tạm thời không bán)</p>
                      ) : null}

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => openDetail(item)}
                          className="flex-1 rounded-lg border border-blue-800/60 bg-transparent py-2 text-sm font-medium text-white transition hover:bg-blue-900/40"
                        >
                          Chi tiết
                        </button>
                        <button
                          type="button"
                          disabled={!canBuy || addingId === catalogItemId}
                          onClick={() => handleAddToCart(catalogItemId)}
                          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {addingId === catalogItemId ? '...' : 'Thêm'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => updateQuery({ page: String(page - 1) })}
                className="rounded-xl border border-blue-900/50 bg-[#0d1f3c]/70 px-5 py-2 text-sm text-white transition hover:bg-blue-900/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Trang trước
              </button>
              <span className="text-sm text-slate-400">
                Trang {page + 1} / {Math.max(totalPages, 1)}
              </span>
              <button
                type="button"
                disabled={page + 1 >= Math.max(totalPages, 1)}
                onClick={() => updateQuery({ page: String(page + 1) })}
                className="rounded-xl border border-blue-900/50 bg-[#0d1f3c]/70 px-5 py-2 text-sm text-white transition hover:bg-blue-900/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Trang sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default IotHubPage

