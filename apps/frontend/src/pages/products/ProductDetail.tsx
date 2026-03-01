import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { listingApi } from '../../api/listingApi'
import { Listing } from '../../types/models'
import { useAuth } from '../../context/AuthContext'
import { formatCategoryLabel, formatCurrency, mapApiError } from '../../lib/format'
import { Button } from '../../components/ui/Button'

const ProductDetail: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { id } = useParams()

  const [item, setItem] = useState<Listing | null>(null)
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
        setError(mapApiError(err, 'Khong the tai chi tiet bai dang'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <p className="text-sm text-slate-500">Dang tai chi tiet...</p>
  if (error || !item) return <p className="text-sm text-red-600">{error || 'Khong tim thay bai dang'}</p>

  const isMine = user?.id === item.ownerId

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full sm:h-[400px]">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl drop-shadow-md">{item.title}</h1>
          <p className="mt-4 text-xl font-medium text-slate-300">{formatCurrency(item.price)}</p>
        </div>

        <div className="absolute left-6 top-6 z-20">
          <Button
            variant="outline"
            className="rounded-full border-blue-500/30 bg-slate-900/60 text-blue-400 backdrop-blur-md hover:bg-slate-800/80 hover:text-blue-300"
            onClick={() => navigate('/products')}
          >
            Quay lai
          </Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="flex flex-col gap-10 text-white">
            <section>
              <h2 className="text-2xl font-bold tracking-tight">Chi tiet san pham</h2>
              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                  {formatCategoryLabel(item.category)}
                </span>
              </div>
              <p className="mt-6 whitespace-pre-line leading-relaxed text-slate-300">{item.description}</p>
            </section>
          </div>

          <div className="flex flex-col gap-6 text-white">
            <div className="rounded-2xl border border-blue-500/20 bg-slate-900/50 p-6 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-colors hover:border-blue-500/40">
              <h3 className="text-xl font-bold text-white">Lien he nguoi ban</h3>
              <div className="mt-6 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Nguoi ban</span>
                  <span className="font-semibold text-slate-200">{item.ownerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Ton kho tham khao</span>
                  <span className="font-semibold text-slate-200">{item.stock}</span>
                </div>
              </div>

              <p className="mt-6 text-sm text-slate-400">
                San pham trong muc nay la giao dich P2P. Ban va nguoi ban tu trao doi qua chat.
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <Button
                  className="w-full rounded-full bg-blue-600 py-6 text-base font-medium text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]"
                  disabled={isMine}
                  onClick={() => navigate(`/messages?contactListingId=${item.id}`)}
                >
                  {isMine ? 'San pham cua ban' : 'Lien he'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full border-blue-500/50 bg-slate-800 py-6 text-base font-medium text-blue-400 hover:bg-slate-700 hover:text-blue-300"
                  onClick={() => navigate('/products')}
                >
                  Xem san pham khac
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
