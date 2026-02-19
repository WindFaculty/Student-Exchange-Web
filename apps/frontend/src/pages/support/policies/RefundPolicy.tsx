import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import PageHeader from '../../../components/ui/PageHeader'

const RefundPolicy = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-5">
      <Button variant="ghost" onClick={() => navigate('/support/policies')}>Quay lại</Button>

      <PageHeader title="Chính sách hoàn tiền" description="Cập nhật ngày 16/02/2026" />

      <Card>
        <CardHeader>
          <CardTitle>Điều kiện áp dụng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <p>Hoàn tiền được xem xét khi đơn giao sai, hư hỏng, hoặc khác biệt đáng kể với mô tả.</p>
          <p>Yêu cầu hoàn tiền cần gửi qua ticket hỗ trợ kèm mã đơn và bằng chứng.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thời hạn yêu cầu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <p>Yêu cầu hoàn tiền phải gửi trong vòng 7 ngày kể từ ngày nhận hàng.</p>
          <p>Đội hỗ trợ sẽ phản hồi trong 24-48 giờ làm việc.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phương án xử lý</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <p>Khoản hoàn tiền được xử lý qua kênh thanh toán ban đầu nếu khả dụng.</p>
          <p>Nếu từ chối hoàn tiền, hệ thống sẽ nêu rõ lý do và hướng xử lý tiếp theo.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default RefundPolicy
