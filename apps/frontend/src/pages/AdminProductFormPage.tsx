import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminApi } from '../api/adminApi'
import { ListingRequest } from '../types/models'
import { mapApiError } from '../lib/format'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import PageHeader from '../components/ui/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'

const categories = ['WORKSHOP_SLOT', 'MENTORING', 'KIT', 'CONSULTATION']

const emptyForm: ListingRequest = {
  title: '',
  description: '',
  category: categories[0],
  price: 0,
  stock: 1,
  imageUrl: '',
}

const AdminProductFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = useMemo(() => Boolean(id), [id])

  const [form, setForm] = useState<ListingRequest>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pageLoading, setPageLoading] = useState(isEdit)

  useEffect(() => {
    if (!isEdit || !id) return

    const listingId = Number(id)
    if (!Number.isFinite(listingId)) {
      setError('ID bài đăng không hợp lệ')
      setPageLoading(false)
      return
    }

    const loadListing = async () => {
      setPageLoading(true)
      setError('')
      try {
        const listing = await adminApi.getListing(listingId)
        setForm({
          title: listing.title,
          description: listing.description || '',
          category: listing.category,
          price: listing.price,
          stock: listing.stock,
          imageUrl: listing.imageUrl || '',
        })
      } catch (err: unknown) {
        setError(mapApiError(err, 'Không thể tải thông tin bài đăng'))
      } finally {
        setPageLoading(false)
      }
    }

    loadListing()
  }, [id, isEdit])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.title.trim()) {
      setError('Tiêu đề là bắt buộc')
      return
    }
    if (form.price <= 0) {
      setError('Giá phải lớn hơn 0')
      return
    }
    if (form.stock < 0) {
      setError('Tồn kho không hợp lệ')
      return
    }

    setLoading(true)
    setError('')
    try {
      if (isEdit && id) {
        await adminApi.updateListing(Number(id), form)
      } else {
        await adminApi.createListing(form)
      }
      navigate('/admin/listings')
    } catch (err: unknown) {
      setError(mapApiError(err, 'Lưu bài đăng thất bại'))
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return <p className="text-sm text-slate-500">Đang tải dữ liệu bài đăng...</p>
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={isEdit ? 'Cập nhật bài đăng' : 'Tạo bài đăng mới'}
        description="Quản lý thông tin hiển thị trên marketplace."
        actions={<Button variant="outline" onClick={() => navigate('/admin/listings')}>Quay lại</Button>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-sm font-medium">Tiêu đề</label>
              <Input
                required
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Mô tả</label>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className="min-h-32 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Danh mục</label>
                <select
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Giá (VND)</label>
                <Input
                  required
                  type="number"
                  min={1}
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Tồn kho</label>
                <Input
                  required
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(event) => setForm((current) => ({ ...current, stock: Number(event.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">URL hình ảnh</label>
                <Input
                  value={form.imageUrl || ''}
                  onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex gap-2">
              <Button type="submit" loading={loading}>
                {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật bài đăng' : 'Tạo bài đăng'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/admin/listings')}>
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminProductFormPage
