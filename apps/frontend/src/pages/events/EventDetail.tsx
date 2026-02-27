import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { eventApi } from '../../api/eventApi'
import { Event } from '../../types/models'
import { formatCurrency, formatDateTime, mapApiError } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'


const EventDetail: React.FC = () => {
  const { id } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await eventApi.getEvent(Number(id))
        setEvent(data)
      } catch (err: unknown) {
        setError(mapApiError(err, 'Không thể tải thông tin sự kiện'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleRegister = async (eventId: number) => {
    setError('')
    setSuccess('')
    try {
      const result = await eventApi.registerEvent(eventId, { name, email, phone, note })
      setSuccess(`Đăng ký thành công, mã đăng ký: #${result.id}`)
    } catch (err: unknown) {
      setError(mapApiError(err, 'Đăng ký sự kiện thất bại'))
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Đang tải sự kiện...</p>
  if (error || !event) return <p className="text-sm text-red-600">{error || 'Không tìm thấy sự kiện'}</p>

  return (
    <div className="flex flex-col">
      {/* Hero Banner Area */}
      <div className="relative h-[250px] w-full bg-slate-900 sm:h-[350px]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-900/80" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl drop-shadow-md">
            {event.title}
          </h1>
          <p className="mt-4 text-lg font-medium text-blue-300">
            {formatDateTime(event.startAt)} - {formatDateTime(event.endAt)}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-[1.3fr_1fr]">
          {/* Left Column: Event details */}
          <div className="flex flex-col gap-8 text-white">
            <section>
              <h2 className="text-2xl font-bold tracking-tight">Về sự kiện</h2>
              <p className="mt-2 text-lg font-medium text-slate-400">{event.summary}</p>
              <div className="mt-6 rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
                <p className="text-sm text-slate-300"><strong className="text-slate-100">Địa điểm:</strong> {event.location}</p>
                <p className="mt-2 text-sm text-slate-300"><strong className="text-slate-100">Ngày bắt đầu:</strong> {formatDateTime(event.startAt)}</p>
                <p className="mt-2 text-sm text-slate-300"><strong className="text-slate-100">Ngày kết thúc:</strong> {formatDateTime(event.endAt)}</p>
                <p className="mt-2 text-sm text-slate-300"><strong className="text-slate-100">Phí tham gia:</strong> <span className="text-emerald-400">{formatCurrency(event.fee)}</span></p>
              </div>
              <p className="mt-6 whitespace-pre-line leading-relaxed text-slate-300">
                {event.description}
              </p>
            </section>
          </div>

          {/* Right Column: Registration Form */}
          <div className="flex flex-col gap-6 text-white">
            <div className="rounded-2xl border border-blue-500/20 bg-slate-900/50 p-6 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <h3 className="text-xl font-bold text-white">Đăng ký tham gia</h3>
              <p className="mt-2 text-sm text-slate-400">Điền thông tin của bạn để giữ chỗ.</p>

              <div className="mt-6 space-y-4">
                <div>
                  <Input placeholder="Họ và tên" value={name} onChange={(e) => setName(e.target.value)} className="border-slate-700 bg-slate-800 text-white placeholder-slate-400" />
                </div>
                <div>
                  <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border-slate-700 bg-slate-800 text-white placeholder-slate-400" />
                </div>
                <div>
                  <Input placeholder="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} className="border-slate-700 bg-slate-800 text-white placeholder-slate-400" />
                </div>
                <div>
                  <textarea
                    placeholder="Ghi chú thêm"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-28 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {error ? <p className="mt-4 text-sm font-medium text-red-500">{error}</p> : null}
              {success ? <p className="mt-4 text-sm font-medium text-emerald-500">{success}</p> : null}

              <div className="mt-6">
                <Button
                  className="w-full rounded-full bg-blue-600 py-6 text-base font-medium text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]"
                  onClick={() => handleRegister(event.id)}
                >
                  Gửi Đăng Ký
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetail
