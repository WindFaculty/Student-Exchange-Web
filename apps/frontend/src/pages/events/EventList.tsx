import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { eventApi } from '../../api/eventApi'
import { Event } from '../../types/models'
import { formatCurrency, formatDateTime, mapApiError } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'

const EventList: React.FC = () => {
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await eventApi.getEvents({ page: 0, size: 20 })
        setEvents(data.content)
      } catch (err: unknown) {
        setError(mapApiError(err, 'Không thể tải danh sách sự kiện'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader title="Sự kiện nổi bật" description="Đăng ký tham gia workshop, hội chợ và hackathon dành cho sinh viên." />

      {loading ? <p className="text-sm text-slate-500">Đang tải sự kiện...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <div className="h-40 bg-slate-100 dark:bg-slate-800">
              {event.imageUrl ? <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" /> : null}
            </div>
            <CardContent className="space-y-2 pt-4">
              <h2 className="text-lg font-semibold">{event.title}</h2>
              <p className="line-clamp-2 text-sm text-slate-500">{event.summary}</p>
              <p className="text-sm">{formatDateTime(event.startAt)}</p>
              <p className="text-sm text-slate-500">{event.location}</p>
              <p className="text-sm font-medium">Phí tham gia: {formatCurrency(event.fee)}</p>
              <Button className="mt-2" size="sm" onClick={() => navigate(`/events/${event.id}`)}>
                Xem chi tiết
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default EventList
