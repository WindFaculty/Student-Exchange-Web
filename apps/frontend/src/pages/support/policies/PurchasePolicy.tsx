import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import PageHeader from '../../../components/ui/PageHeader'

const PurchasePolicy = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-5">
      <Button variant="ghost" onClick={() => navigate('/support/policies')}>Quay lại</Button>

      <PageHeader title="Chính sách mua hàng" description="Cập nhật ngày 16/02/2026" />

      <Card>
        <CardHeader>
          <CardTitle>Đặt hàng và thanh toán</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <p>Đơn hàng được xác nhận sau khi thanh toán thành công và kiểm tra tồn kho.</p>
          <p>Phương thức thanh toán phụ thuộc loại bài đăng, có thể bao gồm chuyển khoản hoặc COD.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Giao nhận và hoàn tất</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <p>Thời gian giao nhận thay đổi theo khu vực và loại sản phẩm/dịch vụ.</p>
          <p>Người dùng có thể tra cứu trạng thái bằng mã đơn và email tại trang hỗ trợ.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trách nhiệm người mua</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <p>Vui lòng cung cấp đúng họ tên, email và địa chỉ khi thanh toán.</p>
          <p>Nếu thông tin sai, liên hệ hỗ trợ trong vòng 24 giờ kể từ lúc đặt đơn.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default PurchasePolicy
