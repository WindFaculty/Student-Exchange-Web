import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { formatCurrency } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'

const CartPage: React.FC = () => {
  const navigate = useNavigate()
  const { items, loading, updateQuantity, removeFromCart, getCartTotal } = useCart()

  if (loading) return <p className="text-sm text-slate-500">Đang tải giỏ hàng...</p>

  if (items.length === 0) {
    return (
      <EmptyState
        title="Giỏ hàng đang trống"
        description="Hãy thêm một vài bài đăng trước khi thanh toán."
        icon="shopping_cart"
        action={<Button onClick={() => navigate('/products')}>Khám phá bài đăng</Button>}
      />
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Giỏ hàng</h1>

        {items.map((item) => (
          <Card key={item.listingId}>
            <CardContent className="flex flex-wrap items-center gap-4 pt-5">
              <div className="h-16 w-16 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" /> : null}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{item.title}</p>
                <p className="text-sm text-slate-500">{formatCurrency(item.price)}</p>
              </div>

              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateQuantity(item.listingId, Math.max(1, Number(e.target.value) || 1))}
                className="h-10 w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />

              <p className="w-32 text-right text-sm font-semibold">{formatCurrency(item.subtotal)}</p>
              <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.listingId)}>Xóa</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="h-fit p-5">
        <h2 className="text-lg font-semibold">Tóm tắt</h2>
        <p className="mt-3 text-sm text-slate-500">Tổng cộng</p>
        <p className="text-2xl font-bold">{formatCurrency(getCartTotal())}</p>
        <div className="mt-4 space-y-2">
          <Button className="w-full" onClick={() => navigate('/checkout')}>Thanh toán</Button>
          <Button className="w-full" variant="outline" onClick={() => navigate('/products')}>Tiếp tục mua</Button>
        </div>
      </Card>
    </div>
  )
}

export default CartPage
