import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserRole } from '../types/models'

interface ProtectedRouteProps {
  roles?: UserRole[]
  children?: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles, children }) => {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Đang kiểm tra phiên đăng nhập...</div>
  }

  if (!isAuthenticated) {
    const loginPath = roles?.includes('ADMIN') ? '/admin/login' : '/login'
    return <Navigate to={loginPath} replace state={{ from: `${location.pathname}${location.search}${location.hash}` }} />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export default ProtectedRoute
