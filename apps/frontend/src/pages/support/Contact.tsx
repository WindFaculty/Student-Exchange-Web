import { FormEvent, useState } from 'react'
import { supportApi } from '../../api/supportApi'
import { SupportTicket } from '../../types/models'
import { mapApiError } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'

const categoryOptions = ['ORDER', 'LISTING', 'EVENT', 'ACCOUNT', 'PAYMENT', 'TECHNICAL']

const Contact = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState(categoryOptions[0])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdTicket, setCreatedTicket] = useState<SupportTicket | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError('Vui lòng nhập đầy đủ các trường bắt buộc')
      return
    }

    setLoading(true)
    setError('')
    try {
      const ticket = await supportApi.createTicket({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        category,
        message: message.trim(),
      })
      setCreatedTicket(ticket)
      setMessage('')
      setSubject('')
    } catch (err: unknown) {
      setError(mapApiError(err, 'Không thể tạo ticket hỗ trợ'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Gửi yêu cầu hỗ trợ" description="Mô tả chi tiết vấn đề để đội ngũ hỗ trợ phản hồi nhanh hơn." />

      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tạo ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm">Họ tên</label>
                  <Input value={name} onChange={(event) => setName(event.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Email</label>
                  <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm">Danh mục</label>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {categoryOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm">Tiêu đề</label>
                <Input value={subject} onChange={(event) => setSubject(event.target.value)} required />
              </div>

              <div>
                <label className="mb-1 block text-sm">Nội dung</label>
                <textarea
                  required
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="min-h-32 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <Button type="submit" loading={loading}>
                {loading ? 'Đang gửi...' : 'Gửi ticket'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hướng dẫn theo dõi</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-300">
              Sau khi gửi thành công, hãy dùng mã ticket và email để tra cứu trạng thái tại trang Theo dõi.
            </CardContent>
          </Card>

          {createdTicket ? (
            <Card>
              <CardHeader>
                <CardTitle>Ticket vừa tạo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Mã ticket:</strong> {createdTicket.ticketCode}</p>
                <p><strong>Trạng thái:</strong> {createdTicket.status}</p>
                <p><strong>Email:</strong> {createdTicket.email}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default Contact
