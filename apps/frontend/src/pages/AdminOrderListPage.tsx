import { useEffect, useMemo, useState } from 'react'
import { adminApi } from '../api/adminApi'
import { Order, OrderStatus } from '../types/models'
import { formatCurrency, formatDateTime, mapApiError } from '../lib/format'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import PageHeader from '../components/ui/PageHeader'
import FilterToolbar from '../components/ui/FilterToolbar'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table'

const PAGE_SIZE = 10
const statusFilters: Array<OrderStatus | ''> = ['', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED']

const statusToBadge = (status: OrderStatus): 'warning' | 'info' | 'secondary' | 'success' | 'outline' | 'destructive' => {
  if (status === 'PENDING') return 'warning'
  if (status === 'CONFIRMED' || status === 'PROCESSING') return 'info'
  if (status === 'SHIPPING') return 'secondary'
  if (status === 'DELIVERED') return 'success'
  if (status === 'CANCELLED') return 'destructive'
  return 'outline'
}

const nextStatusOptions = (status: OrderStatus): OrderStatus[] => {
  if (status === 'PENDING') return ['CONFIRMED', 'CANCELLED']
  if (status === 'CONFIRMED') return ['PROCESSING', 'CANCELLED']
  if (status === 'PROCESSING') return ['SHIPPING', 'CANCELLED']
  if (status === 'SHIPPING') return ['DELIVERED']
  return []
}

const AdminOrderListPage = () => {
  const [rows, setRows] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)

  const selectedOrder = useMemo(() => rows.find((row) => row.id === selectedOrderId) ?? null, [rows, selectedOrderId])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await adminApi.getOrders({
        status: statusFilter,
        page,
        size: PAGE_SIZE,
      })
      setRows(response.content)
      setTotalPages(response.totalPages)
      if (response.content.length > 0 && selectedOrderId === null) {
        setSelectedOrderId(response.content[0].id)
      }
    } catch (err: unknown) {
      setError(mapApiError(err, 'Không thể tải danh sách đơn hàng'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page])

  const handleUpdateStatus = async (orderId: number, nextStatus: OrderStatus) => {
    setUpdatingOrderId(orderId)
    setError('')
    try {
      await adminApi.updateOrderStatus(orderId, nextStatus)
      await loadData()
    } catch (err: unknown) {
      setError(mapApiError(err, 'Cập nhật trạng thái thất bại'))
    } finally {
      setUpdatingOrderId(null)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Quy trình đơn hàng" description="Theo dõi trạng thái và xử lý các đơn hàng theo từng bước." />

      <FilterToolbar className="grid gap-3 md:grid-cols-[220px_auto] md:items-center">
        <select
          className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as OrderStatus | '')
            setPage(0)
          }}
        >
          {statusFilters.map((status) => (
            <option key={status || 'ALL'} value={status}>
              {status || 'Tất cả trạng thái'}
            </option>
          ))}
        </select>
      </FilterToolbar>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Mã đơn</TableHeaderCell>
                <TableHeaderCell>Khách hàng</TableHeaderCell>
                <TableHeaderCell>Tổng tiền</TableHeaderCell>
                <TableHeaderCell>Trạng thái</TableHeaderCell>
                <TableHeaderCell>Thời gian</TableHeaderCell>
                <TableHeaderCell className="text-right">Thao tác</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-slate-500">Đang tải dữ liệu...</TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-slate-500">Không có đơn hàng phù hợp.</TableCell>
                </TableRow>
              ) : (
                rows.map((order) => (
                  <TableRow
                    key={order.id}
                    className={order.id === selectedOrderId ? 'bg-primary/5 dark:bg-primary/10' : ''}
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <TableCell className="font-semibold text-primary">{order.orderCode}</TableCell>
                    <TableCell>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-xs text-slate-500">{order.customerEmail}</p>
                    </TableCell>
                    <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge variant={statusToBadge(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {nextStatusOptions(order.status).length === 0 ? (
                          <span className="text-xs text-slate-400">Không có</span>
                        ) : (
                          nextStatusOptions(order.status).map((status) => (
                            <Button
                              key={status}
                              size="sm"
                              variant={status === 'CANCELLED' ? 'destructive' : 'outline'}
                              disabled={updatingOrderId === order.id}
                              onClick={(event) => {
                                event.stopPropagation()
                                handleUpdateStatus(order.id, status)
                              }}
                            >
                              {status}
                            </Button>
                          ))
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
          {!selectedOrder ? (
            <p className="text-sm text-slate-500">Chọn một đơn hàng để xem chi tiết.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedOrder.orderCode}</h3>
                <p className="text-sm text-slate-500">{formatDateTime(selectedOrder.createdAt)}</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800">
                <p><strong>Khách hàng:</strong> {selectedOrder.customerName}</p>
                <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                <p><strong>Địa chỉ:</strong> {selectedOrder.customerAddress}</p>
                <p><strong>Trạng thái:</strong> {selectedOrder.status}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Sản phẩm</h4>
                {selectedOrder.items.map((item) => (
                  <div key={`${item.listingId}-${item.listingTitle}`} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
                    <p className="font-medium">{item.listingTitle}</p>
                    <p className="text-slate-500">SL: {item.quantity} x {formatCurrency(item.unitPrice)}</p>
                    <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              <p className="text-lg font-bold text-slate-900 dark:text-white">Tổng: {formatCurrency(selectedOrder.totalAmount)}</p>
            </div>
          )}
        </aside>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" disabled={page <= 0} onClick={() => setPage((current) => current - 1)}>
          Trang trước
        </Button>
        <span className="text-sm text-slate-500">Trang {page + 1} / {Math.max(totalPages, 1)}</span>
        <Button
          variant="outline"
          disabled={page + 1 >= Math.max(totalPages, 1)}
          onClick={() => setPage((current) => current + 1)}
        >
          Trang sau
        </Button>
      </div>
    </div>
  )
}

export default AdminOrderListPage
