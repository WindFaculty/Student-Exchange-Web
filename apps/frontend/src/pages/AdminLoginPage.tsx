import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mapApiError } from '../lib/format'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import Icon from '../components/ui/Icon'

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, logout } = useAuth()

  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const session = await login(username, password)
      if (session.role !== 'ADMIN') {
        await logout()
        throw new Error('Tài khoản không có quyền quản trị')
      }
      navigate('/admin', { replace: true })
    } catch (err: unknown) {
      setError(mapApiError(err, 'Đăng nhập quản trị thất bại'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light px-4 py-8 dark:bg-background-dark">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon name="admin_panel_settings" />
          </div>
          <CardTitle>Đăng nhập quản trị</CardTitle>
          <CardDescription>Tài khoản mẫu: admin / admin123</CardDescription>
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
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập quản trị'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminLoginPage
