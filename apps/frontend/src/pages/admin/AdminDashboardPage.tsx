import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api/adminApi'
import { locationApi } from '../../api/locationApi'
import { Order, VnAddressSyncStatus } from '../../types/models'
import { formatCurrency, formatDateTime, mapApiError } from '../../lib/format'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table'
import EmptyState from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'

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

const formatSyncTime = (value?: string) => (value ? formatDateTime(value) : '-')

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>(emptyStats)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [syncStatus, setSyncStatus] = useState<VnAddressSyncStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncLoading, setSyncLoading] = useState(false)
  const [error, setError] = useState('')
  const [syncFeedback, setSyncFeedback] = useState('')

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const [listings, orders, events, tickets, sync] = await Promise.all([
        adminApi.getListings({ page: 0, size: 1 }),
        adminApi.getOrders({ page: 0, size: 5 }),
        adminApi.getEvents({ page: 0, size: 1 }),
        adminApi.getSupportTickets({ status: 'PENDING', page: 0, size: 1 }),
        locationApi.getSyncStatus(),
      ])

      setStats({
        listingCount: listings.totalElements,
        orderCount: orders.totalElements,
        eventCount: events.totalElements,
        pendingTicketCount: tickets.totalElements,
      })
      setRecentOrders(orders.content)
      setSyncStatus(sync)
    } catch (err: unknown) {
      setError(mapApiError(err, 'Khong the tai du lieu bang dieu khien'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const handleSyncAddress = async () => {
    setSyncLoading(true)
    setSyncFeedback('')
    try {
      const result = await locationApi.triggerSync()
      const status = await locationApi.getSyncStatus()
      setSyncStatus(status)
      setSyncFeedback(`Dong bo thanh cong (${result.provinceCount} tinh, ${result.districtCount} huyen, ${result.wardCount} xa/phuong)`)
    } catch (err: unknown) {
      setSyncFeedback(mapApiError(err, 'Dong bo that bai'))
    } finally {
      setSyncLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tong quan van hanh"
        description="Theo doi nhanh don hang, bai dang, su kien va ticket ho tro."
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tong bai dang" value={loading ? '...' : stats.listingCount} icon="list_alt" />
        <StatCard label="Tong don hang" value={loading ? '...' : stats.orderCount} icon="shopping_bag" />
        <StatCard label="Su kien hoat dong" value={loading ? '...' : stats.eventCount} icon="event_available" />
        <StatCard
          label="Ticket dang cho"
          value={loading ? '...' : stats.pendingTicketCount}
          icon="confirmation_number"
          trendTone="negative"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Don hang gan day</h2>
            <Link className="text-sm font-medium text-primary hover:underline" to="/admin/orders">Xem tat ca</Link>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell>Ma don</TableHeaderCell>
                  <TableHeaderCell>Khach hang</TableHeaderCell>
                  <TableHeaderCell>Trang thai</TableHeaderCell>
                  <TableHeaderCell>Tong tien</TableHeaderCell>
                  <TableHeaderCell>Thoi gian</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell className="py-8 text-slate-500" colSpan={5}>Dang tai du lieu...</TableCell>
                  </TableRow>
                ) : recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell className="py-8" colSpan={5}>
                      <EmptyState title="Chua co don hang" description="Du lieu don hang se hien thi tai day." />
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

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Dieu huong nhanh</h3>
            <div className="mt-4 space-y-3 text-sm">
              <Link to="/admin/listings" className="block rounded-lg bg-slate-50 px-3 py-2 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
                Quan ly bai dang
              </Link>
              <Link to="/admin/orders" className="block rounded-lg bg-slate-50 px-3 py-2 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
                Xu ly don hang
              </Link>
              <Link to="/admin/events" className="block rounded-lg bg-slate-50 px-3 py-2 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
                Quan ly su kien
              </Link>
              <Link to="/admin/tickets" className="block rounded-lg bg-slate-50 px-3 py-2 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
                Ticket ho tro
              </Link>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Dong bo dia chi VN</h3>
              <Button type="button" size="sm" onClick={handleSyncAddress} loading={syncLoading} disabled={syncLoading}>
                {syncLoading ? 'Dang dong bo...' : 'Dong bo ngay'}
              </Button>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p><strong>Trang thai:</strong> {syncStatus?.lastStatus || '-'}</p>
              <p><strong>Nguon:</strong> {syncStatus?.lastSource || '-'}</p>
              <p><strong>Lan cuoi:</strong> {formatSyncTime(syncStatus?.lastSyncedAt)}</p>
              <p><strong>Thanh cong gan nhat:</strong> {formatSyncTime(syncStatus?.lastSuccessAt)}</p>
              <p>
                <strong>So luong:</strong>{' '}
                {syncStatus ? `${syncStatus.provinceCount} tinh, ${syncStatus.districtCount} huyen, ${syncStatus.wardCount} xa/phuong` : '-'}
              </p>
            </div>

            {syncStatus?.lastError ? (
              <p className="mt-3 text-xs text-red-600">Loi gan nhat: {syncStatus.lastError}</p>
            ) : null}
            {syncFeedback ? (
              <p className={`mt-3 text-xs ${syncFeedback.toLowerCase().includes('thanh cong') ? 'text-emerald-600' : 'text-red-600'}`}>
                {syncFeedback}
              </p>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
