import React, { useEffect, useState } from 'react'
import { listingApi } from '../../api/listingApi'
import { Listing, ListingRequest } from '../../types/models'
import { formatCurrency, mapApiError } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'

const defaultForm: ListingRequest = {
  title: '',
  description: '',
  category: 'WORKSHOP_SLOT',
  price: 0,
  stock: 1,
  imageUrl: '',
}

const CreateListing: React.FC = () => {
  const [items, setItems] = useState<Listing[]>([])
  const [form, setForm] = useState<ListingRequest>(defaultForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listingApi.getMyListings({ page: 0, size: 50 })
      setItems(data.content)
    } catch (err: unknown) {
      setError(mapApiError(err, 'Không thể tải sản phẩm của bạn'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const resetForm = () => {
    setForm(defaultForm)
    setEditingId(null)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      if (editingId) {
        await listingApi.updateListing(editingId, form)
      } else {
        await listingApi.createListing(form)
      }
      resetForm()
      await load()
    } catch (err: unknown) {
      setError(mapApiError(err, 'Không thể lưu sản phẩm'))
    }
  }

  const onEdit = (item: Listing) => {
    setEditingId(item.id)
    setForm({
      title: item.title,
      description: item.description || '',
      category: item.category,
      price: item.price,
      stock: item.stock,
      imageUrl: item.imageUrl || '',
    })
  }

  const onDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return
    try {
      await listingApi.deleteListing(id)
      await load()
    } catch (err: unknown) {
      setError(mapApiError(err, 'Xóa sản phẩm thất bại'))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Sản phẩm của tôi" description="Tạo mới hoặc chỉnh sửa các dịch vụ bạn đang cung cấp." />

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input placeholder="Tiêu đề" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input placeholder="Mô tả ngắn" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <div className="grid gap-3 md:grid-cols-3">
              <select
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="WORKSHOP_SLOT">WORKSHOP_SLOT</option>
                <option value="MENTORING">MENTORING</option>
                <option value="KIT">KIT</option>
                <option value="CONSULTATION">CONSULTATION</option>
              </select>
              <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })} />
              <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) || 0 })} />
            </div>

            <Input placeholder="URL hình ảnh" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex gap-2">
              <Button type="submit">{editingId ? 'Cập nhật' : 'Tạo mới'}</Button>
              {editingId ? <Button type="button" variant="outline" onClick={resetForm}>Hủy</Button> : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Danh sách sản phẩm</h2>
        {loading ? <p className="text-sm text-slate-500">Đang tải danh sách...</p> : null}
        {!loading && items.length === 0 ? <p className="text-sm text-slate-500">Bạn chưa có sản phẩm nào.</p> : null}

        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-slate-500">
                  {item.category} • {formatCurrency(item.price)} • tồn kho {item.stock}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(item)}>Sửa</Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(item.id)}>Xóa</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}

export default CreateListing
