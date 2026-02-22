import React, { useEffect, useState } from 'react'
import { listingApi } from '../../api/listingApi'
import { Listing, ListingRequest } from '../../types/models'
import { formatCurrency, mapApiError } from '../../lib/format'
import { LISTING_FORM_CATEGORIES } from '../../lib/listingCategories'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Icon from '../../components/ui/Icon'

const parseImages = (url: string | undefined): string[] => {
  if (!url) return []
  try {
    const parsed = JSON.parse(url)
    if (Array.isArray(parsed)) return parsed
  } catch (e) {
    // legacy single image
    return [url]
  }
  return [url]
}

const defaultForm: ListingRequest = {
  title: '',
  description: '',
  category: LISTING_FORM_CATEGORIES[0],
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

    if (!form.imageUrl) {
      setError('Vui lòng thêm ít nhất 1 hình ảnh sản phẩm')
      return
    }
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tiêu đề <span className="text-red-500">*</span></label>
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mô tả</label>
              <textarea
                className="h-24 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Danh mục</label>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {LISTING_FORM_CATEGORIES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Giá (VNĐ)</label>
                <Input
                  type="text"
                  placeholder="0"
                  value={form.price ? new Intl.NumberFormat('en-US').format(form.price) : ''}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/[^0-9]/g, '')
                    setForm({ ...form, price: rawValue ? parseInt(rawValue, 10) : 0 })
                  }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Số lượng</label>
                <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) || 0 })} />
              </div>
            </div>

            <div className="space-y-1 block">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Hình ảnh sản phẩm <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {parseImages(form.imageUrl).map((img, idx) => (
                  <div key={idx} className="relative h-24 w-24 overflow-hidden rounded-lg border border-slate-200">
                    <img src={img} alt={`Preview ${idx}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = parseImages(form.imageUrl).filter((_, i) => i !== idx)
                        setForm({ ...form, imageUrl: newImages.length > 0 ? JSON.stringify(newImages) : '' })
                      }}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded bg-black/50 text-white hover:bg-red-500"
                    >
                      <Icon name="close" className="text-[14px]" />
                    </button>
                  </div>
                ))}

                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
                  <Icon name="add_photo_alternate" className="text-2xl text-slate-400" />
                  <span className="mt-1 text-xs text-slate-500">Thêm ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      if (files.length === 0) return

                      let processedCount = 0
                      const newImages = [...parseImages(form.imageUrl)]

                      files.forEach((file) => {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          newImages.push(reader.result as string)
                          processedCount++
                          if (processedCount === files.length) {
                            setForm({ ...form, imageUrl: JSON.stringify(newImages) })
                          }
                        }
                        reader.readAsDataURL(file)
                      })
                      e.target.value = ''
                    }}
                  />
                </label>
              </div>
            </div>

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
              <div className="flex items-center gap-4">
                {item.imageUrl ? (
                  <img src={parseImages(item.imageUrl)[0]} alt={item.title} className="h-16 w-16 object-cover rounded-lg border border-slate-200" />
                ) : (
                  <div className="h-16 w-16 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400 border border-slate-200">
                    <Icon name="image" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-slate-500">
                    {item.category} • {formatCurrency(item.price)} • tồn kho {item.stock}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(item)}>Sửa</Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(item.id)}>Xóa</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div >
  )
}

export default CreateListing
