import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mapApiError } from '../lib/format'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import Icon from '../components/ui/Icon'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [username, setUsername] = useState('student1')
  const [password, setPassword] = useState('user123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(username, password)
      const redirectPath = (location.state as { from?: string } | null)?.from ?? '/products'
      navigate(redirectPath, { replace: true })
    } catch (err: unknown) {
      setError(mapApiError(err, 'Đăng nhập thất bại'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-5xl items-center gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Icon name="school" className="text-[16px]" />
          Student Exchange
        </div>
        <h1 className="text-4xl font-bold leading-tight text-slate-900 dark:text-white">Kết nối cộng đồng học tập và trao đổi</h1>
        <p className="text-slate-500 dark:text-slate-400">Đăng nhập để mua bán khóa học, đăng ký sự kiện và quản lý đơn hàng nhanh chóng.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đăng nhập người dùng</CardTitle>
          <CardDescription>Tài khoản mẫu: student1 / user123</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-sm font-medium">Tên đăng nhập</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Mật khẩu</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button type="submit" loading={loading} className="w-full">
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
