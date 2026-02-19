import { FormEvent, useEffect, useMemo, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import { Event, EventRegistration, EventRequest } from '../../types/models'
import { formatDateTime, mapApiError } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import PageHeader from '../../components/ui/PageHeader'
import Icon from '../../components/ui/Icon'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table'

const PAGE_SIZE = 10

const toInputDateTime = (isoValue: string) => {
  const date = new Date(isoValue)
  if (Number.isNaN(date.getTime())) return ''
  const timezoneOffsetInMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - timezoneOffsetInMs).toISOString().slice(0, 16)
}

const defaultForm = (): EventRequest => {
  const now = new Date()
  const start = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
  return {
    title: '',
    summary: '',
    description: '',
    startAt: toInputDateTime(start.toISOString()),
    endAt: toInputDateTime(end.toISOString()),
    location: '',
    type: 'WORKSHOP',
    fee: 0,
    imageUrl: '',
    active: true,
  }
}

const AdminEventListPage = () => {
  const [rows, setRows] = useState<Event[]>([])
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [selectedEventForRegistrations, setSelectedEventForRegistrations] = useState<number | null>(null)
  const [form, setForm] = useState<EventRequest>(defaultForm)
  const [editingEventId, setEditingEventId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeOnly, setActiveOnly] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const pageTitle = useMemo(() => (editingEventId ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'), [editingEventId])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await adminApi.getEvents({
        search: search || undefined,
        active: activeOnly ? true : undefined,
        page,
        size: PAGE_SIZE,
      })
      setRows(response.content)
      setTotalPages(response.totalPages)
    } catch (err: unknown) {
      setError(mapApiError(err, 'Không thể tải danh sách sự kiện'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeOnly])

  const resetForm = () => {
    setEditingEventId(null)
    setForm(defaultForm)
  }

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPage(0)
    await loadData()
  }

  const handleEdit = (item: Event) => {
    setEditingEventId(item.id)
    setForm({
      title: item.title,
      summary: item.summary || '',
      description: item.description || '',
      startAt: toInputDateTime(item.startAt),
      endAt: toInputDateTime(item.endAt),
      location: item.location,
      type: item.type,
      fee: item.fee,
      imageUrl: item.imageUrl || '',
      active: item.active,
    })
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa sự kiện này?')) return
    try {
      await adminApi.deleteEvent(id)
      if (selectedEventForRegistrations === id) {
        setSelectedEventForRegistrations(null)
        setRegistrations([])
      }
      await loadData()
    } catch (err: unknown) {
      setError(mapApiError(err, 'Xóa sự kiện thất bại'))
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.title.trim()) {
      setError('Tên sự kiện là bắt buộc')
      return
    }
    if (!form.startAt || !form.endAt) {
      setError('Vui lòng chọn thời gian bắt đầu và kết thúc')
      return
    }
    if (new Date(form.endAt).getTime() <= new Date(form.startAt).getTime()) {
      setError('Thời gian kết thúc phải sau thời gian bắt đầu')
      return
    }

    setSaving(true)
    setError('')
    try {
      if (editingEventId) {
        await adminApi.updateEvent(editingEventId, form)
      } else {
        await adminApi.createEvent(form)
      }
      resetForm()
      await loadData()
    } catch (err: unknown) {
      setError(mapApiError(err, 'Lưu sự kiện thất bại'))
    } finally {
      setSaving(false)
    }
  }

  const loadRegistrations = async (eventId: number) => {
    setError('')
    try {
      const response = await adminApi.getEventRegistrations(eventId)
      setSelectedEventForRegistrations(eventId)
      setRegistrations(response)
    } catch (err: unknown) {
      setError(mapApiError(err, 'Không thể tải danh sách đăng ký'))
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Quản lý sự kiện" description="Theo dõi sự kiện, đăng ký và cập nhật thông tin chương trình." />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-3 border-b border-slate-200 p-4 dark:border-slate-800">
            <form className="flex gap-2" onSubmit={handleSearchSubmit}>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm kiếm sự kiện"
                iconLeft={<Icon name="search" className="text-[18px]" />}
              />
              <Button type="submit" variant="outline">Tìm</Button>
            </form>
            <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(event) => {
                  setActiveOnly(event.target.checked)
                  setPage(0)
                }}
              />
              Chỉ hiển thị sự kiện đang hoạt động
            </label>
          </div>

          <div className="max-h-[520px] overflow-y-auto">
            {loading ? (
              <p className="p-4 text-sm text-slate-500">Đang tải danh sách sự kiện...</p>
            ) : rows.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">Không có sự kiện phù hợp.</p>
            ) : (
              rows.map((row) => (
                <div
                  key={row.id}
                  className="w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900 dark:text-white">{row.title}</p>
                    <Badge variant={row.active ? 'success' : 'secondary'}>{row.active ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{formatDateTime(row.startAt)}</p>
                  <p className="text-xs text-slate-500">{row.location}</p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => loadRegistrations(row.id)}>Đăng ký</Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>Sửa</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(row.id)}>Xóa</Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 p-3 dark:border-slate-800">
            <Button size="sm" variant="outline" disabled={page <= 0} onClick={() => setPage((current) => current - 1)}>
              Trước
            </Button>
            <span className="text-xs text-slate-500">Trang {page + 1} / {Math.max(totalPages, 1)}</span>
            <Button
              size="sm"
              variant="outline"
              disabled={page + 1 >= Math.max(totalPages, 1)}
              onClick={() => setPage((current) => current + 1)}
            >
              Sau
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">{pageTitle}</h3>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium">Tên sự kiện</label>
                <Input
                  required
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Tóm tắt</label>
                <Input
                  value={form.summary || ''}
                  onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Mô tả</label>
                <textarea
                  value={form.description || ''}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="min-h-24 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Bắt đầu</label>
                  <Input
                    required
                    type="datetime-local"
                    value={form.startAt}
                    onChange={(event) => setForm((current) => ({ ...current, startAt: event.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Kết thúc</label>
                  <Input
                    required
                    type="datetime-local"
                    value={form.endAt}
                    onChange={(event) => setForm((current) => ({ ...current, endAt: event.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Địa điểm</label>
                  <Input
                    required
                    value={form.location}
                    onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Loại sự kiện</label>
                  <Input
                    required
                    value={form.type}
                    onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Phí tham gia</label>
                  <Input
                    type="number"
                    min={0}
                    value={form.fee}
                    onChange={(event) => setForm((current) => ({ ...current, fee: Number(event.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">URL hình ảnh</label>
                  <Input
                    value={form.imageUrl || ''}
                    onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(form.active)}
                  onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
                />
                Hiển thị sự kiện
              </label>

              <div className="flex gap-2 pt-2">
                <Button type="submit" loading={saving}>
                  {saving ? 'Đang lưu...' : editingEventId ? 'Cập nhật sự kiện' : 'Tạo sự kiện'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>Làm mới</Button>
              </div>
            </form>
          </div>

          {selectedEventForRegistrations !== null && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <h4 className="font-semibold">Đăng ký sự kiện #{selectedEventForRegistrations}</h4>
                <Button size="sm" variant="ghost" onClick={() => setSelectedEventForRegistrations(null)}>
                  Đóng
                </Button>
              </div>

              {registrations.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">Chưa có người đăng ký.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHead>
                      <tr>
                        <TableHeaderCell>Họ tên</TableHeaderCell>
                        <TableHeaderCell>Email</TableHeaderCell>
                        <TableHeaderCell>Số điện thoại</TableHeaderCell>
                        <TableHeaderCell>Trạng thái</TableHeaderCell>
                        <TableHeaderCell>Thời gian</TableHeaderCell>
                      </tr>
                    </TableHead>
                    <TableBody>
                      {registrations.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.email}</TableCell>
                          <TableCell>{row.phone || '-'}</TableCell>
                          <TableCell>{row.status}</TableCell>
                          <TableCell>{formatDateTime(row.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminEventListPage
