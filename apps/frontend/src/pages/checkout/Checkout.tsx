import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderApi } from '../../api/orderApi'
import { useCart } from '../../context/CartContext'
import { formatCurrency, mapApiError } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const { items, getCartTotal, refreshCart } = useCart()

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-slate-500">Giỏ hàng trống, vui lòng thêm sản phẩm trước khi thanh toán.</p>
        <Button className="mt-4" onClick={() => navigate('/products')}>Về trang bài đăng</Button>
      </Card>
    )
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const order = await orderApi.createOrder({ customerName, customerEmail, customerAddress })
      await refreshCart()
      navigate(`/order-success/${order.orderCode}`)
    } catch (err: unknown) {
      setError(mapApiError(err, 'Không thể tạo đơn hàng'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Thanh toán</h1>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium">Họ và tên</label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Địa chỉ nhận hàng</label>
            <textarea
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              required
              className="min-h-28 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" loading={loading}>
            {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
          </Button>
        </form>
      </Card>

      <Card className="h-fit p-6">
        <h2 className="text-xl font-semibold">Tóm tắt đơn hàng</h2>
        <div className="mt-3 space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.listingId} className="flex items-center justify-between gap-2">
              <span className="line-clamp-1">{item.title} x {item.quantity}</span>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-slate-200 pt-3 text-lg font-semibold dark:border-slate-700">
          Tổng: {formatCurrency(getCartTotal())}
        </div>
      </Card>
    </div>
  )
}

export default CheckoutPage
