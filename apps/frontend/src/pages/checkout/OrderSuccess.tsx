import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { orderApi } from '../../api/orderApi'
import { Order } from '../../types/models'
import { formatCurrency, mapApiError } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import Icon from '../../components/ui/Icon'

const OrderSuccessPage: React.FC = () => {
  const navigate = useNavigate()
  const { orderCode } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orderCode) return
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await orderApi.getOrder(orderCode)
        setOrder(data)
      } catch (err: unknown) {
        setError(mapApiError(err, 'Không tìm thấy đơn hàng'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [orderCode])

  if (loading) return <p className="text-sm text-slate-500">Đang tải đơn hàng...</p>
  if (error || !order) return <p className="text-sm text-red-600">{error || 'Không tìm thấy đơn hàng'}</p>

  return (
    <Card className="space-y-4 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          <Icon name="check_circle" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">Đặt hàng thành công</h1>
          <p className="text-sm text-slate-500">Mã đơn: <strong>{order.orderCode}</strong></p>
        </div>
      </div>

      <div className="space-y-2">
        {order.items.map((item) => (
          <div key={`${item.listingId}-${item.listingTitle}`} className="flex items-center justify-between text-sm">
            <span>{item.listingTitle} x {item.quantity}</span>
            <span>{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <p className="text-lg font-semibold">Tổng: {formatCurrency(order.totalAmount)}</p>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate('/support/track-order')}>Theo dõi đơn</Button>
        <Button onClick={() => navigate('/products')}>Tiếp tục mua</Button>
      </div>
    </Card>
  )
}

export default OrderSuccessPage
