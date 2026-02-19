import { FormEvent, useState } from 'react'
import { orderApi } from '../../api/orderApi'
import { supportApi } from '../../api/supportApi'
import { Order, SupportTicket } from '../../types/models'
import { formatCurrency, formatDateTime, mapApiError } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'

type TrackMode = 'ORDER' | 'TICKET'

const TrackOrder = () => {
  const [mode, setMode] = useState<TrackMode>('ORDER')
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [ticket, setTicket] = useState<SupportTicket | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!code.trim() || !email.trim()) {
      setError('Vui lòng nhập mã và email')
      return
    }

    setLoading(true)
    setError('')
    setOrder(null)
    setTicket(null)

    try {
      if (mode === 'ORDER') {
        const response = await orderApi.trackOrder(code.trim(), email.trim())
        setOrder(response)
      } else {
        const response = await supportApi.trackTicket(code.trim(), email.trim())
        setTicket(response)
      }
    } catch (err: unknown) {
      setError(mapApiError(err, `Không thể tra cứu ${mode === 'ORDER' ? 'đơn hàng' : 'ticket'}`))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Tra cứu đơn hàng / ticket" description="Nhập mã và email để xem trạng thái xử lý mới nhất." />

      <Card>
        <CardHeader>
          <CardTitle>Biểu mẫu tra cứu</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <Button type="button" variant={mode === 'ORDER' ? 'default' : 'outline'} onClick={() => setMode('ORDER')}>
                Đơn hàng
              </Button>
              <Button type="button" variant={mode === 'TICKET' ? 'default' : 'outline'} onClick={() => setMode('TICKET')}>
                Ticket
              </Button>
            </div>

            <div>
              <label className="mb-1 block text-sm">{mode === 'ORDER' ? 'Mã đơn hàng' : 'Mã ticket'}</label>
              <Input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder={mode === 'ORDER' ? 'ORD-...' : 'TIC-...'}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm">Email</label>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" loading={loading}>{loading ? 'Đang tra cứu...' : 'Tra cứu'}</Button>
          </form>
        </CardContent>
      </Card>

      {order ? (
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng {order.orderCode}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 text-sm md:grid-cols-2">
              <p><strong>Trạng thái:</strong> {order.status}</p>
              <p><strong>Khách hàng:</strong> {order.customerName}</p>
              <p><strong>Email:</strong> {order.customerEmail}</p>
              <p><strong>Địa chỉ:</strong> {order.customerAddress}</p>
              <p><strong>Tạo lúc:</strong> {formatDateTime(order.createdAt)}</p>
              <p><strong>Tổng:</strong> {formatCurrency(order.totalAmount)}</p>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-3 py-2">Sản phẩm</th>
                    <th className="px-3 py-2">SL</th>
                    <th className="px-3 py-2">Đơn giá</th>
                    <th className="px-3 py-2">Tạm tính</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={`${item.listingId}-${item.listingTitle}`} className="border-t border-slate-200 dark:border-slate-700">
                      <td className="px-3 py-2">{item.listingTitle}</td>
                      <td className="px-3 py-2">{item.quantity}</td>
                      <td className="px-3 py-2">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-3 py-2">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {ticket ? (
        <Card>
          <CardHeader>
            <CardTitle>Ticket {ticket.ticketCode}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Trạng thái:</strong> {ticket.status}</p>
            <p><strong>Tiêu đề:</strong> {ticket.subject}</p>
            <p><strong>Danh mục:</strong> {ticket.category}</p>
            <p><strong>Nội dung:</strong> {ticket.message}</p>
            <p><strong>Tạo lúc:</strong> {formatDateTime(ticket.createdAt)}</p>
            {ticket.adminReply ? <p><strong>Phản hồi từ admin:</strong> {ticket.adminReply}</p> : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

export default TrackOrder
