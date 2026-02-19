import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api/adminApi'
import { Order } from '../../types/models'
import { formatCurrency, formatDateTime, mapApiError } from '../../lib/format'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table'
import EmptyState from '../../components/ui/EmptyState'

interface DashboardStats {
  listingCount: number
  orderCount: number
  eventCount: number
  pendingTicketCount: number
}

const emptyStats: DashboardStats = {
  listingCount: 0,
  orderCount: 0,
  eventCount: 0,
  pendingTicketCount: 0,
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>(emptyStats)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [listings, orders, events, tickets] = await Promise.all([
          adminApi.getListings({ page: 0, size: 1 }),
          adminApi.getOrders({ page: 0, size: 5 }),
          adminApi.getEvents({ page: 0, size: 1 }),
          adminApi.getSupportTickets({ status: 'PENDING', page: 0, size: 1 }),
        ])

        setStats({
          listingCount: listings.totalElements,
          orderCount: orders.totalElements,
          eventCount: events.totalElements,
          pendingTicketCount: tickets.totalElements,
        })
        setRecentOrders(orders.content)
      } catch (err: unknown) {
        setError(mapApiError(err, 'Không thể tải dữ liệu bảng điều khiển'))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng quan vận hành"
        description="Theo dõi nhanh chỉ số đơn hàng, bài đăng, sự kiện và ticket hỗ trợ."
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng bài đăng" value={loading ? '...' : stats.listingCount} icon="list_alt" />
        <StatCard label="Tổng đơn hàng" value={loading ? '...' : stats.orderCount} icon="shopping_bag" />
        <StatCard label="Sự kiện hoạt động" value={loading ? '...' : stats.eventCount} icon="event_available" />
        <StatCard
          label="Ticket đang chờ"
          value={loading ? '...' : stats.pendingTicketCount}
          icon="confirmation_number"
          trendTone="negative"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Đơn hàng gần đây</h2>
            <Link className="text-sm font-medium text-primary hover:underline" to="/admin/orders">Xem tất cả</Link>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell>Mã đơn</TableHeaderCell>
                  <TableHeaderCell>Khách hàng</TableHeaderCell>
                  <TableHeaderCell>Trạng thái</TableHeaderCell>
                  <TableHeaderCell>Tổng tiền</TableHeaderCell>
                  <TableHeaderCell>Thời gian</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell className="py-8 text-slate-500" colSpan={5}>Đang tải dữ liệu...</TableCell>
                  </TableRow>
                ) : recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell className="py-8" colSpan={5}>
                      <EmptyState title="Chưa có đơn hàng" description="Dữ liệu đơn hàng sẽ hiển thị tại đây." />
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-semibold text-primary">{order.orderCode}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Điều hướng nhanh</h3>
          <div className="mt-4 space-y-3 text-sm">
            <Link to="/admin/listings" className="block rounded-lg bg-slate-50 px-3 py-2 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
              Quản lý bài đăng
            </Link>
            <Link to="/admin/orders" className="block rounded-lg bg-slate-50 px-3 py-2 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
              Xử lý đơn hàng
            </Link>
            <Link to="/admin/events" className="block rounded-lg bg-slate-50 px-3 py-2 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
              Quản lý sự kiện
            </Link>
            <Link to="/admin/tickets" className="block rounded-lg bg-slate-50 px-3 py-2 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
              Ticket hỗ trợ
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboardPage
