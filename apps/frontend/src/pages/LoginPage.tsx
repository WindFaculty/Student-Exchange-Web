import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mapApiError } from '../lib/format'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import Icon from '../components/ui/Icon'
import { GoogleLogin } from '@react-oauth/google'

type AuthMode = 'login' | 'register'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register, googleLogin } = useAuth()

  const [mode, setMode] = useState<AuthMode>('login')
  const [loginUsername, setLoginUsername] = useState('student1')
  const [loginPassword, setLoginPassword] = useState('user123')
  const [registerUsername, setRegisterUsername] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getRedirectPath = () => (location.state as { from?: string } | null)?.from ?? '/products'

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(loginUsername, loginPassword)
      navigate(getRedirectPath(), { replace: true })
    } catch (err: unknown) {
      setError(mapApiError(err, 'Đăng nhập thất bại'))
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await register(registerUsername, registerEmail, registerPassword)
      navigate(getRedirectPath(), { replace: true })
    } catch (err: unknown) {
      setError(mapApiError(err, 'Đăng ký tài khoản thất bại'))
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (nextMode: AuthMode) => {
    if (nextMode === mode) {
      return
    }

    setMode(nextMode)
    setError('')
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      setLoading(true)
      setError('')
      try {
        await googleLogin(credentialResponse.credential)
        navigate(getRedirectPath(), { replace: true })
      } catch (err: unknown) {
        setError(mapApiError(err, 'Đăng nhập Google thất bại'))
      } finally {
        setLoading(false)
      }
    }
  }

  const handleGoogleError = () => {
    setError('Đăng nhập Google thất bại.')
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-5xl items-center gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Icon name="school" className="text-[16px]" />
          Student Exchange
        </div>
        <h1 className="text-4xl font-bold leading-tight text-slate-900 dark:text-white">Kết nối cộng đồng học tập và trao đổi</h1>
        <p className="text-slate-500 dark:text-slate-400">Đăng nhập hoặc đăng ký để mua bán khóa học, đăng ký sự kiện và quản lý đơn hàng nhanh chóng.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <Button
              type="button"
              className="w-full"
              variant={mode === 'login' ? 'default' : 'ghost'}
              onClick={() => switchMode('login')}
            >
              Đăng nhập
            </Button>
            <Button
              type="button"
              className="w-full"
              variant={mode === 'register' ? 'default' : 'ghost'}
              onClick={() => switchMode('register')}
            >
              Đăng ký
            </Button>
          </div>
          <CardTitle>{mode === 'login' ? 'Đăng nhập người dùng' : 'Đăng ký tài khoản'}</CardTitle>
          <CardDescription>
            {mode === 'login' ? 'Tài khoản mẫu: student1 / user123' : 'Tài khoản đăng ký mới có quyền USER.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'login' ? (
            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div className="space-y-1">
                <label className="text-sm font-medium">Tên đăng nhập</label>
                <Input value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} required />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Mật khẩu</label>
                <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <Button type="submit" loading={loading} className="w-full">
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-slate-500 dark:bg-slate-900 dark:text-slate-400">Hoặc tiếp tục với</span>
                </div>
              </div>

              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                />
              </div>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleRegisterSubmit}>
              <div className="space-y-1">
                <label className="text-sm font-medium">Tên đăng nhập</label>
                <Input value={registerUsername} onChange={(e) => setRegisterUsername(e.target.value)} required />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Mật khẩu</label>
                <Input
                  type="password"
                  minLength={6}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                />
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <Button type="submit" loading={loading} className="w-full">
                {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-slate-500 dark:bg-slate-900 dark:text-slate-400">Hoặc tiếp tục với</span>
                </div>
              </div>

              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
