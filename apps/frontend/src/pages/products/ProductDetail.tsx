import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { listingApi } from '../../api/listingApi'
import { Listing } from '../../types/models'
import { useCart } from '../../context/CartContext'
import { formatCurrency, mapApiError } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'

const ProductDetail: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { addToCart } = useCart()

  const [item, setItem] = useState<Listing | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await listingApi.getListing(Number(id))
        setItem(data)
      } catch (err: unknown) {
        setError(mapApiError(err, 'Không thể tải chi tiết bài đăng'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <p className="text-sm text-slate-500">Đang tải chi tiết...</p>
  if (error || !item) return <p className="text-sm text-red-600">{error || 'Không tìm thấy bài đăng'}</p>

  const maxQty = Math.max(item.stock, 1)

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <Card className="overflow-hidden">
        <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800">
          {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" /> : null}
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/products')}>Quay lại</Button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{item.title}</h1>
          <p className="text-sm text-slate-500">Danh mục: {item.category}</p>
          <p className="text-slate-700 dark:text-slate-300">{item.description}</p>
          <p className="text-2xl font-bold">{formatCurrency(item.price)}</p>
          <p className="text-sm text-slate-500">Tồn kho: {item.stock}</p>

          <div className="w-32">
            <label className="mb-1 block text-sm font-medium">Số lượng</label>
            <Input
              type="number"
              min={1}
              max={maxQty}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(maxQty, Number(e.target.value) || 1)))}
            />
          </div>

          <div className="flex gap-3">
            <Button disabled={item.stock <= 0} onClick={() => addToCart(item.id, quantity)}>
              Thêm vào giỏ
            </Button>
            <Button
              variant="secondary"
              disabled={item.stock <= 0}
              onClick={async () => {
                await addToCart(item.id, quantity)
                navigate('/checkout')
              }}
            >
              Mua ngay
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ProductDetail
