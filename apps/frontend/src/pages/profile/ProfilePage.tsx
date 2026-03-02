import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api/authApi'
import { orderApi } from '../../api/orderApi'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency, formatDateTime, mapApiError } from '../../lib/format'
import { MyOrderScope, Order, OrderStatus } from '../../types/models'
import AddressPicker, { AddressPickerValue } from '../../components/address/AddressPicker'
import { Modal } from '../../components/ui/Modal'
import AvatarCropModal from '../../components/ui/AvatarCropModal'

const PAGE_SIZE = 10
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^(0\d{9}|\+84\d{9})$/

// ── Status badge ───────────────────────────────────────────────────────────────

type BadgeVariant = 'warning' | 'info' | 'processing' | 'shipping' | 'success' | 'destructive' | 'default'

const STATUS_MAP: Record<OrderStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Chờ xử lý', variant: 'warning' },
  CONFIRMED: { label: 'Đã xác nhận', variant: 'info' },
  PROCESSING: { label: 'Đang xử lý', variant: 'processing' },
  SHIPPING: { label: 'Đang giao', variant: 'shipping' },
  DELIVERED: { label: 'Đã giao', variant: 'success' },
  CANCELLED: { label: 'Đã huỷ', variant: 'destructive' },
}

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  warning: 'text-amber-600  bg-amber-50   border-amber-200  dark:text-amber-400  dark:bg-amber-400/10  dark:border-amber-400/20',
  info: 'text-cyan-600   bg-cyan-50    border-cyan-200   dark:text-cyan-400   dark:bg-cyan-400/10   dark:border-cyan-400/20',
  processing: 'text-violet-600 bg-violet-50  border-violet-200 dark:text-violet-400 dark:bg-violet-400/10 dark:border-violet-400/20',
  shipping: 'text-blue-600   bg-blue-50    border-blue-200   dark:text-blue-400   dark:bg-blue-400/10   dark:border-blue-400/20',
  success: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-400/10 dark:border-emerald-400/20',
  destructive: 'text-red-600    bg-red-50     border-red-200    dark:text-red-400    dark:bg-red-400/10    dark:border-red-400/20',
  default: 'text-slate-600  bg-slate-50   border-slate-200  dark:text-slate-400  dark:bg-slate-400/10  dark:border-slate-400/20',
}

const DOT_CLASSES: Record<BadgeVariant, string> = {
  warning: 'bg-amber-500  dark:bg-amber-400',
  info: 'bg-cyan-500   dark:bg-cyan-400',
  processing: 'bg-violet-500 dark:bg-violet-400',
  shipping: 'bg-blue-500   dark:bg-blue-400',
  success: 'bg-emerald-500 dark:bg-emerald-400',
  destructive: 'bg-red-500    dark:bg-red-400',
  default: 'bg-slate-400',
}

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const { label, variant } = STATUS_MAP[status] ?? { label: status, variant: 'default' as BadgeVariant }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${BADGE_CLASSES[variant]}`}>
      <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${DOT_CLASSES[variant]}`} />
      {label}
    </span>
  )
}

// ── Helper ─────────────────────────────────────────────────────────────────────

const getInitials = (name: string) => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?'
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase()
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-2 text-sm">
    <span className="w-24 shrink-0 text-slate-500 dark:text-slate-400">{label}:</span>
    <span className="break-words text-slate-700 dark:text-slate-200">{value}</span>
  </div>
)

// ── Order detail modal ─────────────────────────────────────────────────────────

const OrderDetailModal = ({ order, onClose }: { order: Order; onClose: () => void }) => (
  <Modal isOpen onClose={onClose} className="max-w-lg">
    <div className="mb-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-primary dark:text-cyan-400 mb-1">
        Chi tiết đơn hàng
      </p>
      <h2 className="font-mono text-lg font-bold text-slate-900 dark:text-white">{order.orderCode}</h2>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{formatDateTime(order.createdAt)}</p>
      <div className="mt-2"><StatusBadge status={order.status} /></div>
    </div>

    <div className="mb-4 rounded-lg border p-3 space-y-2 border-slate-200 bg-slate-50 dark:border-white/[0.06] dark:bg-white/[0.03]">
      <InfoRow label="Khách hàng" value={order.customerName} />
      <InfoRow label="Số điện thoại" value={order.customerPhone} />
      <InfoRow label="Email" value={order.customerEmail || '-'} />
      <InfoRow label="Địa chỉ" value={order.customerAddress} />
    </div>

    <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500">
      Sản phẩm
    </p>
    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
      {order.items.map((item) => (
        <div
          key={`${item.catalogItemId}-${item.title}`}
          className="rounded-lg border p-3 border-slate-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.03]"
        >
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.title}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            SL: {item.quantity} × {formatCurrency(item.unitPrice)}
          </p>
          <p className="mt-1 text-sm font-bold text-primary dark:text-cyan-400">
            {formatCurrency(item.subtotal)}
          </p>
        </div>
      ))}
    </div>

    <div className="flex items-center justify-between border-t pt-4 border-slate-200 dark:border-white/[0.06]">
      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tổng cộng</span>
      <span className="text-xl font-extrabold text-primary dark:text-cyan-400">
        {formatCurrency(order.totalAmount)}
      </span>
    </div>
  </Modal>
)

// ── Main page ──────────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, refreshSession } = useAuth()

  // Profile
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [addressValue, setAddressValue] = useState<AddressPickerValue>({
    addressLine: '',
    provinceCode: '',
    districtCode: '',
    wardCode: '',
  })
  const [addressPreview, setAddressPreview] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  // Change password
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')

  // Orders
  const [scope] = useState<MyOrderScope>('BOTH')
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [modalOrder, setModalOrder] = useState<Order | null>(null)

  // Avatar upload
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  )

  useEffect(() => {
    if (!user) return
    setFullName(user.fullName)
    setEmail(user.email)
    setPhone(user.phone ?? '')
    setAddressValue({
      addressLine: user.addressLine ?? user.address ?? '',
      provinceCode: user.provinceCode ?? '',
      districtCode: user.districtCode ?? '',
      wardCode: user.wardCode ?? '',
    })
    setAddressPreview(user.address ?? '')
  }, [user])

  useEffect(() => {
    const load = async () => {
      setOrdersLoading(true)
      setOrdersError('')
      try {
        const res = await orderApi.getMyOrders({ scope, page, size: PAGE_SIZE })
        setOrders(res.content)
        setTotalPages(res.totalPages)
      } catch (err: unknown) {
        setOrdersError(mapApiError(err, 'Không thể tải danh sách đơn hàng'))
      } finally {
        setOrdersLoading(false)
      }
    }
    load()
  }, [scope, page])

  useEffect(() => {
    if (orders.length === 0) { setSelectedOrderId(null); return }
    if (!orders.some((o) => o.id === selectedOrderId)) setSelectedOrderId(orders[0].id)
  }, [orders, selectedOrderId])

  const handleSaveProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    const normalizedEmail = email.trim()
    const normalizedPhone = phone.trim()
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setProfileError('Email khong dung dinh dang')
      return
    }
    if (normalizedPhone && !PHONE_PATTERN.test(normalizedPhone)) {
      setProfileError('So dien thoai phai dung dinh dang 0xxxxxxxxx hoac +84xxxxxxxxx')
      return
    }

    const normalizedAddressLine = addressValue.addressLine.trim()
    const normalizedProvinceCode = addressValue.provinceCode.trim()
    const normalizedDistrictCode = addressValue.districtCode.trim()
    const normalizedWardCode = addressValue.wardCode.trim()
    const hasStructuredSelection = !!(normalizedProvinceCode || normalizedDistrictCode || normalizedWardCode)
    if (hasStructuredSelection && (!normalizedProvinceCode || !normalizedDistrictCode || !normalizedWardCode)) {
      setProfileError('Vui long chon day du tinh/thanh, quan/huyen va xa/phuong')
      return
    }

    setProfileSaving(true)
    try {
      const payload: Parameters<typeof authApi.updateProfile>[0] = {
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: normalizedPhone || undefined,
      }
      if (hasStructuredSelection) {
        payload.addressLine = normalizedAddressLine || undefined
        payload.provinceCode = normalizedProvinceCode
        payload.districtCode = normalizedDistrictCode
        payload.wardCode = normalizedWardCode
      } else {
        payload.address = normalizedAddressLine || undefined
      }
      await authApi.updateProfile(payload)
      await refreshSession()
      setProfileSuccess('Đã cập nhật thông tin tài khoản')
    } catch (err: unknown) {
      setProfileError(mapApiError(err, 'Không thể cập nhật thông tin'))
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPwdError('')
    setPwdSuccess('')

    if (newPwd !== confirmPwd) {
      setPwdError('Mật khẩu mới xác nhận không khớp')
      return
    }
    if (newPwd.length < 8) {
      setPwdError('Mật khẩu mới phải có ít nhất 8 ký tự')
      return
    }

    setPwdSaving(true)
    try {
      await authApi.changePassword({ currentPassword: currentPwd, newPassword: newPwd })
      setPwdSuccess('Đã đổi mật khẩu thành công')
      setCurrentPwd('')
      setNewPwd('')
      setConfirmPwd('')
    } catch (err: unknown) {
      setPwdError(mapApiError(err, 'Không thể đổi mật khẩu'))
    } finally {
      setPwdSaving(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setAvatarError('Vui lòng chọn file ảnh hợp lệ')
      return
    }
    // Read the file and open crop modal
    const reader = new FileReader()
    reader.onload = (ev) => setCropSrc(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCropConfirm = async (croppedDataUrl: string) => {
    setCropSrc(null)
    setAvatarUploading(true)
    setAvatarError('')
    try {
      await authApi.uploadAvatar(croppedDataUrl)
      await refreshSession()
    } catch (err: unknown) {
      setAvatarError(mapApiError(err, 'Không thể tải ảnh lên'))
    } finally {
      setAvatarUploading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Trang cá nhân</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Quản lý thông tin tài khoản và theo dõi đơn hàng của bạn
          </p>
        </div>
        <button
          onClick={() => navigate('/support/track-order')}
          className="
            inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all
            border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary hover:bg-primary/5 shadow-sm
            dark:border-cyan-500/20 dark:bg-cyan-500/5 dark:text-cyan-400 dark:hover:border-cyan-400/50 dark:hover:bg-cyan-500/10
          "
        >
          <span>🔍</span>
          Tra cứu bằng mã đơn
        </button>
      </div>

      {/* ── Profile card ────────────────────────────────────────── */}
      <div className={glassCard}>
        {/* Avatar + name row */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {/* Clickable avatar uploader */}
          <div className="relative shrink-0 group">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="relative flex h-14 w-14 items-center justify-center rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-cyan-400 focus:ring-offset-2"
              title="Đổi ảnh đại diện"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-extrabold text-white dark:ring-2 dark:ring-cyan-500/20">
                  {getInitials(user?.fullName ?? '')}
                </div>
              )}
              {/* Hover overlay */}
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                {avatarUploading ? (
                  <span className="text-lg animate-spin">⟳</span>
                ) : (
                  <>
                    <span className="text-base">📷</span>
                    <span className="text-[9px] font-bold text-white leading-none tracking-wide">Đổi ảnh</span>
                  </>
                )}
              </span>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-slate-900 dark:text-white truncate">
              {user?.fullName || user?.username || '—'}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">@{user?.username}</p>
          </div>
          <span className="
            rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-widest
            border-primary/30 bg-primary/5 text-primary
            dark:border-cyan-400/25 dark:bg-cyan-400/10 dark:text-cyan-400
          ">
            {user?.role ?? 'USER'}
          </span>
        </div>

        {avatarError && (
          <p className="-mt-2 mb-4 text-xs text-red-500">⚠️ {avatarError}</p>
        )}

        {/* ── Update profile form ── */}
        <p className="mb-5 text-[11px] font-bold uppercase tracking-widest text-primary dark:text-cyan-400">
          Thông tin tài khoản
        </p>

        <form onSubmit={handleSaveProfile}>
          <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className={labelCls}>Tên đăng nhập</label>
              <input className={fieldCls + ' cursor-not-allowed opacity-60'} value={user?.username ?? ''} disabled />
            </div>
            <div>
              <label className={labelCls}>Vai trò</label>
              <input className={fieldCls + ' cursor-not-allowed opacity-60'} value={user?.role ?? ''} disabled />
            </div>
            <div>
              <label className={labelCls}>Họ và tên</label>
              <input className={fieldCls} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" className={fieldCls} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>So dien thoai</label>
              <input type="tel" className={fieldCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="sm:col-span-2 xl:col-span-3">
              <label className={labelCls}>Dia chi</label>
              <AddressPicker
                value={addressValue}
                onChange={setAddressValue}
                onResolvedChange={(resolved) => setAddressPreview(resolved.fullAddress)}
                fieldClassName={fieldCls}
                labelClassName={labelCls}
              />
              {addressPreview ? (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Dia chi day du: {addressPreview}
                </p>
              ) : null}
            </div>
          </div>

          {profileError && <p className="mb-3 text-sm text-red-500">⚠️ {profileError}</p>}
          {profileSuccess && <p className="mb-3 text-sm text-emerald-600 dark:text-emerald-400">✅ {profileSuccess}</p>}

          <button type="submit" disabled={profileSaving} className={primaryBtn}>
            {profileSaving ? '⟳ Đang lưu...' : 'Lưu thông tin'}
          </button>
        </form>

        {/* ── Divider ── */}
        <hr className="my-7 border-slate-200 dark:border-white/[0.07]" />

        {/* ── Change password form ── */}
        <p className="mb-5 text-[11px] font-bold uppercase tracking-widest text-primary dark:text-cyan-400">
          Đổi mật khẩu
        </p>

        <form onSubmit={handleChangePassword}>
          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Mật khẩu hiện tại</label>
              <input
                type="password"
                className={fieldCls}
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className={labelCls}>Mật khẩu mới</label>
              <input
                type="password"
                className={fieldCls}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                required
                placeholder="Ít nhất 8 ký tự"
              />
            </div>
            <div>
              <label className={labelCls}>Xác nhận mật khẩu mới</label>
              <input
                type="password"
                className={fieldCls}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          {pwdError && <p className="mb-3 text-sm text-red-500">⚠️ {pwdError}</p>}
          {pwdSuccess && <p className="mb-3 text-sm text-emerald-600 dark:text-emerald-400">✅ {pwdSuccess}</p>}

          <button type="submit" disabled={pwdSaving} className={primaryBtn}>
            {pwdSaving ? '⟳ Đang đổi...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>

      {/* ── Orders card ─────────────────────────────────────────── */}
      <div className={glassCard}>
        <div className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary dark:text-cyan-400">
            Đơn hàng của tôi
          </p>
        </div>

        {ordersError && <p className="mb-4 text-sm text-red-500">⚠️ {ordersError}</p>}

        {/* Table + detail split */}
        <div className="grid gap-4 xl:grid-cols-[1fr_340px]">

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/[0.06]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/[0.06] dark:bg-white/[0.03]">
                  {['Mã đơn', 'Trạng thái', 'Tổng tiền', 'Thời gian', ''].map((h, i) => (
                    <th
                      key={i}
                      className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ordersLoading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-slate-400 animate-pulse">
                      Đang tải đơn hàng...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                      📦 Chưa có đơn hàng phù hợp
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const isSelected = order.id === selectedOrderId
                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrderId(order.id)}
                        className={`
                          cursor-pointer border-b border-slate-100 transition-colors last:border-0
                          dark:border-white/[0.04]
                          ${isSelected
                            ? 'bg-primary/5 dark:bg-cyan-500/[0.07] border-l-2 border-l-primary dark:border-l-cyan-400'
                            : 'hover:bg-slate-50 dark:hover:bg-white/[0.03]'}
                        `}
                      >
                        <td className="px-4 py-3 font-mono text-sm font-semibold text-primary dark:text-cyan-400">
                          {order.orderCode}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-500">
                          {formatDateTime(order.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); setModalOrder(order) }}
                            className="
                              rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all
                              border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary
                              dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-400 dark:hover:border-cyan-400/40 dark:hover:text-cyan-400
                            "
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Detail panel — desktop only */}
          <div className="
            max-h-[420px] overflow-y-auto rounded-xl border p-5
            border-slate-200 bg-slate-50
            dark:border-white/[0.06] dark:bg-black/20
          ">
            {!selectedOrder ? (
              <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 opacity-40">
                <span className="text-3xl">📄</span>
                <p className="text-sm text-slate-500 dark:text-slate-400">Chọn một đơn để xem chi tiết</p>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <h3 className="font-mono text-base font-bold text-slate-900 dark:text-white">
                    {selectedOrder.orderCode}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {formatDateTime(selectedOrder.createdAt)}
                  </p>
                  <div className="mt-2"><StatusBadge status={selectedOrder.status} /></div>
                </div>

                <div className="mb-4 rounded-lg border p-3 border-slate-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.03] space-y-2">
                  <InfoRow label="Khách hàng" value={selectedOrder.customerName} />
                  <InfoRow label="Số điện thoại" value={selectedOrder.customerPhone} />
                  <InfoRow label="Email" value={selectedOrder.customerEmail || '-'} />
                  <InfoRow label="Địa chỉ" value={selectedOrder.customerAddress} />
                </div>

                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500">
                  Sản phẩm
                </p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={`${item.catalogItemId}-${item.title}`}
                      className="rounded-lg border p-3 border-slate-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.03]"
                    >
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        SL: {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                      <p className="mt-1 text-sm font-bold text-primary dark:text-cyan-400">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-4 border-slate-200 dark:border-white/[0.06]">
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tổng cộng</span>
                  <span className="text-lg font-extrabold text-primary dark:text-cyan-400">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-5 flex items-center justify-between">
          <button disabled={page <= 0} onClick={() => setPage((c) => c - 1)} className={paginCls(page <= 0)}>
            ← Trước
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Trang {page + 1} / {Math.max(totalPages, 1)}
          </span>
          <button
            disabled={page + 1 >= Math.max(totalPages, 1)}
            onClick={() => setPage((c) => c + 1)}
            className={paginCls(page + 1 >= Math.max(totalPages, 1))}
          >
            Tiếp →
          </button>
        </div>
      </div>

      {/* ── Order detail modal ───────────────────────────────────── */}
      {modalOrder && <OrderDetailModal order={modalOrder} onClose={() => setModalOrder(null)} />}

      {/* ── Avatar crop modal ────────────────────────────────────── */}
      {cropSrc && (
        <AvatarCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </div>
  )
}

// ── Shared class strings ───────────────────────────────────────────────────────

const glassCard = `
  rounded-2xl border p-8
  border-slate-200 bg-white shadow-sm
  dark:border-white/[0.07] dark:bg-slate-900/70 dark:shadow-none
  dark:[backdrop-filter:blur(18px)]
`.trim()

const labelCls = 'mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400'

const fieldCls = `
  w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all
  border-slate-200 bg-slate-50 text-slate-900
  focus:border-primary focus:ring-2 focus:ring-primary/20
  dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-100
  dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10
`.trim()

const primaryBtn = `
  inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all
  bg-primary hover:bg-primary/90 shadow-sm
  dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600 dark:hover:from-cyan-400 dark:hover:to-blue-500
  dark:shadow-cyan-500/20 dark:hover:shadow-cyan-500/30
  disabled:opacity-60 disabled:cursor-not-allowed
`.trim()

const paginCls = (disabled: boolean) =>
  [
    'rounded-lg border px-4 py-2 text-sm font-semibold transition-all',
    disabled
      ? 'border-slate-200 text-slate-300 cursor-not-allowed dark:border-white/[0.05] dark:text-slate-700'
      : 'border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-cyan-400 dark:hover:border-cyan-500/40 dark:hover:bg-cyan-500/10',
  ].join(' ')

export default ProfilePage
