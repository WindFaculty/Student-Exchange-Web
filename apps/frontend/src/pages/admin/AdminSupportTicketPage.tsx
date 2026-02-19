import { FormEvent, useEffect, useMemo, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import { SupportTicket, SupportTicketStatus } from '../../types/models'
import { formatDateTime, mapApiError } from '../../lib/format'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import Icon from '../../components/ui/Icon'

const PAGE_SIZE = 10
const statusFilters: Array<SupportTicketStatus | ''> = ['', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

const statusToVariant = (status: SupportTicketStatus): 'warning' | 'info' | 'success' | 'secondary' => {
  if (status === 'PENDING') return 'warning'
  if (status === 'IN_PROGRESS') return 'info'
  if (status === 'RESOLVED') return 'success'
  return 'secondary'
}

const AdminSupportTicketPage = () => {
  const [rows, setRows] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | ''>('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [savingReply, setSavingReply] = useState(false)
  const [updatingTicketId, setUpdatingTicketId] = useState<number | null>(null)

  const selectedTicket = useMemo(() => rows.find((row) => row.id === selectedTicketId) ?? null, [rows, selectedTicketId])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await adminApi.getSupportTickets({
        status: statusFilter,
        page,
        size: PAGE_SIZE,
      })
      setRows(response.content)
      setTotalPages(response.totalPages)
      if (response.content.length > 0 && selectedTicketId === null) {
        setSelectedTicketId(response.content[0].id)
      }
    } catch (err: unknown) {
      setError(mapApiError(err, 'Không thể tải danh sách ticket'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page])

  const handleStatusUpdate = async (ticketId: number, status: SupportTicketStatus) => {
    setUpdatingTicketId(ticketId)
    setError('')
    try {
      await adminApi.updateSupportTicketStatus(ticketId, status)
      await loadData()
    } catch (err: unknown) {
      setError(mapApiError(err, 'Không thể cập nhật trạng thái ticket'))
    } finally {
      setUpdatingTicketId(null)
    }
  }

  const handleReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (selectedTicketId === null) {
      setError('Vui lòng chọn ticket cần phản hồi')
      return
    }
    if (!replyText.trim()) {
      setError('Nội dung phản hồi không được để trống')
      return
    }

    setSavingReply(true)
    setError('')
    try {
      await adminApi.replySupportTicket(selectedTicketId, replyText.trim())
      setReplyText('')
      await loadData()
    } catch (err: unknown) {
      setError(mapApiError(err, 'Không thể gửi phản hồi'))
    } finally {
      setSavingReply(false)
    }
  }

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows
    const keyword = search.trim().toLowerCase()
    return rows.filter((row) => (
      row.ticketCode.toLowerCase().includes(keyword)
      || row.subject.toLowerCase().includes(keyword)
      || row.name.toLowerCase().includes(keyword)
      || row.email.toLowerCase().includes(keyword)
    ))
  }, [rows, search])

  return (
    <div className="flex min-h-[720px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900 xl:flex-row">
      <aside className="w-full shrink-0 border-b border-slate-200 dark:border-slate-800 xl:w-[420px] xl:border-b-0 xl:border-r">
        <div className="space-y-3 border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Hàng đợi ticket</h2>
            <Button size="icon" variant="ghost" onClick={loadData}>
              <Icon name="refresh" />
            </Button>
          </div>

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm kiếm ticket, khách hàng..."
            iconLeft={<Icon name="search" className="text-[18px]" />}
          />

          <select
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as SupportTicketStatus | '')
              setPage(0)
            }}
          >
            {statusFilters.map((status) => (
              <option key={status || 'ALL'} value={status}>
                {status || 'Tất cả trạng thái'}
              </option>
            ))}
          </select>
        </div>

        <div className="max-h-[520px] overflow-y-auto xl:max-h-none xl:h-[calc(100%-186px)]">
          {loading ? (
            <p className="p-4 text-sm text-slate-500">Đang tải ticket...</p>
          ) : filteredRows.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Không có ticket phù hợp.</p>
          ) : (
            filteredRows.map((row) => (
              <button
                key={row.id}
                type="button"
                className={`w-full border-b border-slate-100 px-4 py-3 text-left transition dark:border-slate-800 ${selectedTicketId === row.id ? 'bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                onClick={() => {
                  setSelectedTicketId(row.id)
                  setReplyText(row.adminReply || '')
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-500">{row.ticketCode}</p>
                  <Badge variant={statusToVariant(row.status)}>{row.status}</Badge>
                </div>
                <p className="mt-1 font-medium text-slate-900 dark:text-white">{row.subject}</p>
                <p className="text-xs text-slate-500">{row.name} - {row.email}</p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{row.message}</p>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 p-3 dark:border-slate-800">
          <Button size="sm" variant="outline" disabled={page <= 0} onClick={() => setPage((current) => current - 1)}>
            Trang trước
          </Button>
          <span className="text-xs text-slate-500">Trang {page + 1} / {Math.max(totalPages, 1)}</span>
          <Button
            size="sm"
            variant="outline"
            disabled={page + 1 >= Math.max(totalPages, 1)}
            onClick={() => setPage((current) => current + 1)}
          >
            Trang sau
          </Button>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          {!selectedTicket ? (
            <p className="text-sm text-slate-500">Chọn ticket để xem chi tiết</p>
          ) : (
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{selectedTicket.subject}</p>
              <p className="text-xs text-slate-500">{selectedTicket.ticketCode} • {selectedTicket.category}</p>
            </div>
          )}
          {selectedTicket ? (
            <select
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
              value={selectedTicket.status}
              disabled={updatingTicketId === selectedTicket.id}
              onChange={(event) => handleStatusUpdate(selectedTicket.id, event.target.value as SupportTicketStatus)}
            >
              {statusFilters.filter(Boolean).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          ) : null}
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950/40">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {selectedTicket ? (
            <>
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm text-slate-700 dark:text-slate-200">{selectedTicket.message}</p>
                <p className="mt-2 text-xs text-slate-500">Khởi tạo lúc: {formatDateTime(selectedTicket.createdAt)}</p>
              </div>
              {selectedTicket.adminReply ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm text-slate-800 dark:text-slate-100">{selectedTicket.adminReply}</p>
                  <p className="mt-2 text-xs text-slate-500">Phản hồi gần nhất: {formatDateTime(selectedTicket.updatedAt)}</p>
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <form className="space-y-3" onSubmit={handleReply}>
            <textarea
              className="min-h-28 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              placeholder="Nhập phản hồi cho khách hàng..."
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Mẹo: phản hồi ngắn gọn, rõ bước tiếp theo.</span>
              <Button type="submit" loading={savingReply}>
                {savingReply ? 'Đang gửi...' : 'Gửi phản hồi'}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}

export default AdminSupportTicketPage
