import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card'
import PageHeader from '../../../components/ui/PageHeader'

const policies = [
  {
    id: 'purchase',
    title: 'Chính sách mua hàng',
    description: 'Điều khoản đặt hàng, thanh toán và giao nhận.',
    path: '/support/policies/purchase',
  },
  {
    id: 'refund',
    title: 'Chính sách hoàn tiền',
    description: 'Điều kiện chấp nhận hoàn tiền và thời gian xử lý.',
    path: '/support/policies/refund',
  },
]

const PoliciesHub = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <PageHeader title="Chính sách" description="Vui lòng đọc kỹ các chính sách trước khi đặt hàng." />

      <div className="grid gap-4 md:grid-cols-2">
        {policies.map((item) => (
          <Card
            key={item.id}
            className="cursor-pointer transition hover:border-primary/40"
            onClick={() => navigate(item.path)}
          >
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-sm font-medium text-primary">Xem chi tiết</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default PoliciesHub
