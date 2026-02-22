import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { iotApi } from '../../api/iotApi'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { formatCurrency, mapApiError } from '../../lib/format'
import { IOT_COMPONENT_CLASSIFICATION } from '../../lib/listingCategories'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent } from '../../components/ui/Card'
import Icon from '../../components/ui/Icon'
import { IotOverviewResponse, IotSegment, Listing } from '../../types/models'

type IotTabKey = 'components' | 'sample' | 'services'

const DEFAULT_TAB: IotTabKey = 'components'
const TAB_ORDER: IotTabKey[] = ['components', 'sample', 'services']

const TAB_CONFIG: Record<IotTabKey, { label: string; segment: IotSegment }> = {
  components: { label: 'Linh kien', segment: 'COMPONENTS' },
  sample: { label: 'San pham mau', segment: 'SAMPLE_PRODUCTS' },
  services: { label: 'Dich vu', segment: 'SERVICES' },
}

const normalizeTab = (rawTab: string | null): IotTabKey => {
  if (rawTab === 'sample' || rawTab === 'services' || rawTab === 'components') {
    return rawTab
  }
  return DEFAULT_TAB
}

const IotHubPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { addToCart } = useCart()

  const [overview, setOverview] = useState<IotOverviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addingId, setAddingId] = useState<number | null>(null)

  const rawTab = searchParams.get('tab')
  const tab = normalizeTab(rawTab)
  const pageRaw = Number(searchParams.get('page') ?? 0)
  const page = Number.isFinite(pageRaw) && pageRaw >= 0 ? pageRaw : 0
  const search = searchParams.get('search') ?? ''
  const selectedComponentCategory = tab === 'components' ? searchParams.get('category') ?? '' : ''

  useEffect(() => {
    if (rawTab === null || rawTab === tab) {
      return
    }
    const next = new URLSearchParams(searchParams)
    next.set('tab', tab)
    next.set('page', '0')
    setSearchParams(next, { replace: true })
  }, [rawTab, searchParams, setSearchParams, tab])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await iotApi.getOverview(
          selectedComponentCategory
            ? {
                search,
                category: selectedComponentCategory,
                page,
                size: 12,
              }
            : {
                search,
                segment: TAB_CONFIG[tab].segment,
                page,
                size: 12,
              },
        )
        setOverview(data)
      } catch (err: unknown) {
        setError(mapApiError(err, 'Khong the tai du lieu IoT'))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [search, selectedComponentCategory, tab, page])

  const listings: Listing[] = overview?.listings.content ?? []
  const totalPages = overview?.listings.totalPages ?? 0
  const isAdmin = user?.role === 'ADMIN'

  const updateQuery = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) next.delete(key)
      else next.set(key, value)
    })

    if (!next.get('tab')) {
      next.set('tab', DEFAULT_TAB)
    }
    if (!('page' in updates)) {
      next.set('page', '0')
    }

    setSearchParams(next)
  }

  const handleAddToCart = async (listingId: number) => {
    setAddingId(listingId)
    try {
      await addToCart(listingId, 1)
    } catch (err: unknown) {
      setError(mapApiError(err, 'Khong the them vao gio hang'))
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {isAdmin ? (
        <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">IoT Hub</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              {overview?.heroTitle ?? 'IoT Hub cho sinh vien'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {overview?.heroSubtitle ?? 'Kham pha linh kien, bo KIT mau va dich vu IoT cho du an thuc te.'}
            </p>
            <Button onClick={() => navigate(overview?.primaryCtaHref ?? '/listings')}>
              {overview?.primaryCtaLabel ?? 'Dang san pham IoT'}
            </Button>
          </div>
          <div className="overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
            {overview?.heroImageUrl ? (
              <img src={overview.heroImageUrl} alt="IoT hero" className="h-full min-h-52 w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-52 items-center justify-center text-slate-400">
                <Icon name="devices_other" className="text-5xl" />
              </div>
            )}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(overview?.highlights ?? []).map((item) => (
          <Card key={item.id}>
            <CardContent className="space-y-2 pt-5">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon name={item.icon} />
              </div>
              <h2 className="text-base font-semibold">{item.title}</h2>
              <p className="text-sm text-slate-500">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {TAB_ORDER.map((item) => {
                const active = item === tab
                return (
                  <Button
                    key={item}
                    type="button"
                    size="sm"
                    variant={active ? 'default' : 'outline'}
                    onClick={() => updateQuery({ tab: item, page: '0', category: item === 'components' ? selectedComponentCategory : '' })}
                  >
                    {TAB_CONFIG[item].label}
                  </Button>
                )
              })}
            </div>
            <Input
              value={search}
              onChange={(event) => updateQuery({ search: event.target.value, page: '0' })}
              placeholder="Tim theo tieu de hoac mo ta"
              iconLeft={<Icon name="search" className="text-[18px]" />}
            />
            {tab === 'components' ? (
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <div>
                  <select
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                    value={selectedComponentCategory}
                    onChange={(event) => updateQuery({ category: event.target.value, page: '0' })}
                  >
                    <option value="">Tat ca nhom linh kien</option>
                    {IOT_COMPONENT_CLASSIFICATION.map((group) => (
                      <option key={group.category} value={group.category}>{group.category}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {loading ? <p className="text-sm text-slate-500">Dang tai du lieu IoT...</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {!loading && !error && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-800">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" /> : null}
                </div>
                <CardContent className="space-y-2 pt-4">
                  <h3 className="line-clamp-2 text-base font-semibold">{item.title}</h3>
                  <p className="line-clamp-2 text-sm text-slate-500">{item.description}</p>
                  <p className="text-lg font-bold">{formatCurrency(item.price)}</p>
                  <p className="text-xs text-slate-500">Ton kho: {item.stock}</p>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1" onClick={() => navigate(`/products/${item.id}`)}>
                      Chi tiet
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      loading={addingId === item.id}
                      disabled={item.stock <= 0}
                      onClick={() => handleAddToCart(item.id)}
                    >
                      Them
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && listings.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
            Chua co san pham IoT phu hop voi bo loc.
          </p>
        ) : null}

        <div className="flex items-center justify-between">
          <Button variant="outline" disabled={page <= 0} onClick={() => updateQuery({ page: String(page - 1) })}>
            Trang truoc
          </Button>
          <span className="text-sm text-slate-500">Trang {page + 1} / {Math.max(totalPages, 1)}</span>
          <Button
            variant="outline"
            disabled={page + 1 >= Math.max(totalPages, 1)}
            onClick={() => updateQuery({ page: String(page + 1) })}
          >
            Trang sau
          </Button>
        </div>
      </section>
    </div>
  )
}

export default IotHubPage
