import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import Icon from '../../components/ui/Icon'
import PageHeader from '../../components/ui/PageHeader'

const sections = [
  {
    id: 'faq',
    title: 'FAQ',
    description: 'Tra cứu các câu hỏi phổ biến về bài đăng, đơn hàng và sự kiện.',
    path: '/support/faq',
    icon: 'help',
  },
  {
    id: 'contact',
    title: 'Tạo ticket hỗ trợ',
    description: 'Gửi yêu cầu hỗ trợ và nhận mã ticket để theo dõi.',
    path: '/support/contact',
    icon: 'support_agent',
  },
  {
    id: 'track',
    title: 'Tra cứu đơn / ticket',
    description: 'Theo dõi trạng thái bằng mã đơn hoặc mã ticket.',
    path: '/support/track-order',
    icon: 'monitoring',
  },
  {
    id: 'policies',
    title: 'Chính sách',
    description: 'Xem điều khoản mua hàng và hoàn tiền hiện hành.',
    path: '/support/policies',
    icon: 'gavel',
  },
]

const SupportHub = () => {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <PageHeader title="Trung tâm hỗ trợ" description="Tự phục vụ nhanh, gửi ticket và theo dõi trạng thái xử lý." />

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <Card
            key={section.id}
            className="cursor-pointer transition hover:border-primary/40 hover:shadow-soft"
            onClick={() => navigate(section.path)}
          >
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon name={section.icon} />
              </div>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-sm font-medium text-primary">Mở trang</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default SupportHub
