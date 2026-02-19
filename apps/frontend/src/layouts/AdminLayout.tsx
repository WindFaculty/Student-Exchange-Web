import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Button } from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { cn } from '../lib/utils'

const adminNav = [
  { to: '/admin', label: 'Bảng điều khiển', icon: 'dashboard' },
  { to: '/admin/listings', label: 'Sản phẩm', icon: 'list_alt' },
  { to: '/admin/orders', label: 'Đơn hàng', icon: 'shopping_cart' },
  { to: '/admin/events', label: 'Sự kiện', icon: 'calendar_month' },
  { to: '/admin/tickets', label: 'Hỗ trợ', icon: 'confirmation_number' },
]

const AdminLayout: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { resolvedTheme, toggleTheme } = useTheme()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex lg:flex-col">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon name="admin_panel_settings" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Admin Portal</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quản trị hệ thống</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) => cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
                isActive && 'bg-primary/10 text-primary',
              )}
            >
              <Icon name={item.icon} className="text-[20px]" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-3 dark:border-slate-800">
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <Icon name="logout" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => navigate('/admin')}>
              <Icon name="menu" />
            </Button>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Khu vực quản trị</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" onClick={toggleTheme}>
              <Icon name={resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'} />
            </Button>
            <span className="hidden text-sm text-slate-500 sm:inline">{user?.fullName}</span>
            <Button size="sm" variant="outline" className="lg:hidden" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
