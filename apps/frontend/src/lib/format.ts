const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
})

export const formatCurrency = (value: number) => currencyFormatter.format(value)

export const formatDateTime = (input: string | Date) => {
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return '--'
  return dateTimeFormatter.format(date)
}

export const formatDate = (input: string | Date) => {
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return '--'
  return dateFormatter.format(date)
}

const knownErrorMap: Record<string, string> = {
  'Login failed': 'Đăng nhập thất bại',
  'Admin login failed': 'Đăng nhập quản trị thất bại',
  'Username is already taken': 'Tên đăng nhập đã tồn tại',
  'Email is already registered': 'Email đã được đăng ký',
  'Failed to load listings': 'Không thể tải danh sách bài đăng',
  'Failed to load listing': 'Không thể tải chi tiết bài đăng',
  'Failed to load orders': 'Không thể tải đơn hàng',
  'Failed to load events': 'Không thể tải sự kiện',
  'Failed to load support tickets': 'Không thể tải ticket hỗ trợ',
  'Failed to place order': 'Đặt hàng thất bại',
  'Order not found': 'Không tìm thấy đơn hàng',
  'Failed to create support ticket': 'Không thể tạo ticket hỗ trợ',
  'Registration failed': 'Đăng ký sự kiện thất bại',
}

export const mapApiError = (error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : ''
  if (message in knownErrorMap) {
    return knownErrorMap[message]
  }
  return message || fallback
}
