import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { eventApi } from '../../api/eventApi'
import { Event } from '../../types/models'
import { formatCurrency, formatDateTime, mapApiError } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'

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
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <Card className="space-y-4 p-5">
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <p className="text-sm text-slate-500">{event.summary}</p>
        <p>{event.description}</p>
        <p className="text-sm">Bắt đầu: {formatDateTime(event.startAt)}</p>
        <p className="text-sm">Kết thúc: {formatDateTime(event.endAt)}</p>
        <p className="text-sm">Địa điểm: {event.location}</p>
        <p className="font-semibold">Phí tham gia: {formatCurrency(event.fee)}</p>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="text-xl font-semibold">Đăng ký sự kiện</h2>
        <Input placeholder="Họ và tên" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <textarea
          placeholder="Ghi chú"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-28 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

        <Button onClick={() => handleRegister(event.id)}>Gửi đăng ký</Button>
      </Card>
    </div>
  )
}

export default EventDetail
