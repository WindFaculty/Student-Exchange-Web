import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { listingApi } from '../../api/listingApi'
import { Listing } from '../../types/models'
import { useCart } from '../../context/CartContext'
import { formatCurrency, mapApiError } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'


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
    <div className="flex flex-col">
      {/* Hero Banner */}
      <div className="relative h-[300px] w-full sm:h-[400px]">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl drop-shadow-md">
            {item.title}
          </h1>
          <p className="mt-4 text-xl font-medium text-slate-300">
            {formatCurrency(item.price)}
          </p>
        </div>

        {/* Back Button Overlay */}
        <div className="absolute left-6 top-6 z-20">
          <Button
            variant="outline"
            className="rounded-full border-blue-500/30 bg-slate-900/60 text-blue-400 backdrop-blur-md hover:bg-slate-800/80 hover:text-blue-300"
            onClick={() => navigate('/products')}
          >
            ← Quay lại
          </Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-[1.5fr_1fr]">
          {/* Left Column: Details */}
          <div className="flex flex-col gap-10 text-white">
            <section>
              <h2 className="text-2xl font-bold tracking-tight">Chi tiết sản phẩm</h2>
              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                  {item.category}
                </span>
              </div>
              <p className="mt-6 whitespace-pre-line leading-relaxed text-slate-300">
                {item.description}
              </p>
            </section>
          </div>

          {/* Right Column: Checkout block */}
          <div className="flex flex-col gap-6 text-white">
            <div className="rounded-2xl border border-blue-500/20 bg-slate-900/50 p-6 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-colors hover:border-blue-500/40">
              <h3 className="text-xl font-bold text-white">Mua ngay</h3>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-slate-400">Tồn kho</span>
                <span className="font-semibold text-slate-200">{item.stock}</span>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-slate-300">Số lượng</label>
                <Input
                  type="number"
                  min={1}
                  max={maxQty}
                  value={quantity}
                  className="border-slate-700 bg-slate-800 text-white placeholder-slate-400"
                  onChange={(e) => setQuantity(Math.max(1, Math.min(maxQty, Number(e.target.value) || 1)))}
                />
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <Button
                  className="w-full rounded-full bg-blue-600 py-6 text-base font-medium text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]"
                  disabled={item.stock <= 0}
                  onClick={async () => {
                    await addToCart(item.id, quantity)
                    navigate('/checkout')
                  }}
                >
                  Mua Ngay
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full border-blue-500/50 bg-slate-800 py-6 text-base font-medium text-blue-400 hover:bg-slate-700 hover:text-blue-300"
                  disabled={item.stock <= 0}
                  onClick={() => addToCart(item.id, quantity)}
                >
                  Thêm vào giỏ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
