import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderApi } from '../../api/orderApi'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { formatCurrency, mapApiError } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import AddressPicker, { AddressPickerValue } from '../../components/address/AddressPicker'

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const { items, getCartTotal, refreshCart } = useCart()
  const { user } = useAuth()

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [addressValue, setAddressValue] = useState<AddressPickerValue>({
    addressLine: '',
    provinceCode: '',
    wardCode: '',
  })
  const [resolvedAddress, setResolvedAddress] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    setCustomerName((prev) => prev || user.fullName || '')
    setCustomerEmail((prev) => prev || user.email || '')
    setAddressValue((prev) => ({
      addressLine: prev.addressLine || user.addressLine || user.address || '',
      provinceCode: prev.provinceCode || user.provinceCode || '',
      wardCode: prev.wardCode || user.wardCode || '',
    }))
    setResolvedAddress((prev) => prev || user.address || '')
    setCustomerPhone((prev) => prev || user.phone || '')
  }, [user])

  if (items.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-slate-500">Gio hang trong, vui long them san pham IoT truoc khi thanh toan.</p>
        <Button className="mt-4" onClick={() => navigate('/iot')}>Ve trang IoT</Button>
      </Card>
    )
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const normalizedName = customerName.trim()
    const normalizedPhone = customerPhone.trim()
    const normalizedEmail = customerEmail.trim()
    const normalizedAddressLine = addressValue.addressLine.trim()
    const normalizedProvinceCode = addressValue.provinceCode.trim()
    const normalizedWardCode = addressValue.wardCode.trim()
    const normalizedAddress = resolvedAddress.trim()

    if (!normalizedName || !normalizedPhone) {
      setError('Vui long nhap day du ho ten va so dien thoai')
      return
    }
    if (!normalizedAddressLine || !normalizedProvinceCode || !normalizedWardCode) {
      setError('Vui long nhap so nha/duong va chon day du tinh-thanh, xa-phuong')
      return
    }
    if (!normalizedAddress) {
      setError('Khong the tao dia chi giao hang day du. Vui long kiem tra lai thong tin dia chi.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const order = await orderApi.createOrder({
        customerName: normalizedName,
        customerAddress: normalizedAddress,
        customerPhone: normalizedPhone,
        customerEmail: normalizedEmail || undefined,
      })
      await refreshCart()
      navigate(`/order-success/${order.orderCode}`)
    } catch (err: unknown) {
      setError(mapApiError(err, 'Khong the tao don hang'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Thanh toan</h1>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium">Ho va ten</label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Dia chi nhan hang</label>
            <AddressPicker
              value={addressValue}
              onChange={setAddressValue}
              onResolvedChange={(resolved) => setResolvedAddress(resolved.fullAddress)}
              requiredSelection
              requiredAddressLine
              fieldClassName="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              labelClassName="mb-1 block text-xs font-medium"
            />
            {resolvedAddress ? <p className="mt-2 text-xs text-slate-500">Dia chi day du: {resolvedAddress}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">So dien thoai</label>
            <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email (tuy chon)</label>
            <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" loading={loading}>
            {loading ? 'Dang xu ly...' : 'Xac nhan dat hang'}
          </Button>
        </form>
      </Card>

      <Card className="h-fit p-6">
        <h2 className="text-xl font-semibold">Tom tat don hang</h2>
        <div className="mt-3 space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.catalogItemId} className="flex items-center justify-between gap-2">
              <span className="line-clamp-1">{item.title} x {item.quantity}</span>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-slate-200 pt-3 text-lg font-semibold dark:border-slate-700">
          Tong: {formatCurrency(getCartTotal())}
        </div>
      </Card>
    </div>
  )
}

export default CheckoutPage
