import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { listingApi } from '../../api/listingApi'
import { Listing } from '../../types/models'
import { useCart } from '../../context/CartContext'
import { formatCurrency, mapApiError } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent } from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Icon from '../../components/ui/Icon'

const ProductList: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { addToCart } = useCart()

  const [items, setItems] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalPages, setTotalPages] = useState(0)

  const page = Number(searchParams.get('page') ?? 0)
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await listingApi.getListings({ search, category, page, size: 12 })
        setItems(data.content)
        setTotalPages(data.totalPages)
      } catch (err: unknown) {
        setError(mapApiError(err, 'Không thể tải danh sách bài đăng'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [search, category, page])

  const categories = useMemo(() => ['WORKSHOP_SLOT', 'MENTORING', 'KIT', 'CONSULTATION'], [])

  const updateQuery = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) next.delete(key)
      else next.set(key, value)
    })
    if (!('page' in updates)) next.set('page', '0')
    setSearchParams(next)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chợ trao đổi sinh viên"
        description="Khám phá workshop, mentoring, bộ kit học tập và dịch vụ tư vấn."
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <Input
            value={search}
            onChange={(e) => updateQuery({ search: e.target.value, page: '0' })}
            placeholder="Tìm theo tiêu đề hoặc mô tả"
            iconLeft={<Icon name="search" className="text-[18px]" />}
          />
          <select
            className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
            value={category}
            onChange={(e) => updateQuery({ category: e.target.value, page: '0' })}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? <p className="text-sm text-slate-500">Đang tải bài đăng...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-800">
                {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" /> : null}
              </div>
              <CardContent className="space-y-2 pt-4">
                <h2 className="line-clamp-2 text-base font-semibold">{item.title}</h2>
                <p className="line-clamp-2 text-sm text-slate-500">{item.description}</p>
                <p className="text-lg font-bold">{formatCurrency(item.price)}</p>
                <p className="text-xs text-slate-500">Tồn kho: {item.stock}</p>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1" onClick={() => navigate(`/products/${item.id}`)}>
                    Chi tiết
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={item.stock <= 0}
                    onClick={() => addToCart(item.id, 1)}
                  >
                    Thêm
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" disabled={page <= 0} onClick={() => updateQuery({ page: String(page - 1) })}>
          Trang trước
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
    </div>
  )
}

export default ProductList
