import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useChat } from '../context/ChatContext'
import { useTheme } from '../context/ThemeContext'
import { Button } from './ui/Button'
import Icon from './ui/Icon'
import { cn } from '../lib/utils'

const navItems = [
  { to: '/products', label: 'Sáº£n pháº©m' },
  { to: '/events', label: 'Sá»± kiá»‡n' },
  { to: '/messages', label: 'Tin nhan' },
  { to: '/listings', label: 'Sáº£n pháº©m cá»§a tÃ´i' },
  { to: '/iot', label: 'IoT' },
  { to: '/support', label: 'Há»— trá»£' },
]

const Header: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const { getCartItemCount } = useCart()
  const { unreadCount } = useChat()
  const { resolvedTheme, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button className="inline-flex items-center gap-2" onClick={() => navigate('/products')} type="button">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Icon name="school" className="text-lg" />
          </span>
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white sm:text-base">Student Exchange</span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                'rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
                isActive && 'bg-primary/10 text-primary',
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                <span>{item.label}</span>
                {item.to === '/messages' && unreadCount > 0 ? (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-white">{unreadCount}</span>
                ) : null}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            aria-label="Äá»•i giao diá»‡n sÃ¡ng tá»‘i"
            title={resolvedTheme === 'dark' ? 'Chuyá»ƒn sang sÃ¡ng' : 'Chuyá»ƒn sang tá»‘i'}
          >
            <Icon name={resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'} />
          </Button>

          <Button variant="outline" size="sm" onClick={() => navigate('/cart')}>
            <Icon name="shopping_cart" className="text-[18px]" />
            <span>{getCartItemCount()}</span>
          </Button>

          {isAuthenticated ? (
            <>
              {user?.role === 'ADMIN' && (
                <Button size="sm" variant="secondary" onClick={() => navigate('/admin')}>
                  <Icon name="admin_panel_settings" className="text-[18px]" />
                  Quáº£n trá»‹
                </Button>
              )}
              <span className="hidden max-w-[140px] truncate text-sm text-slate-500 sm:inline">{user?.fullName}</span>
              <Button size="sm" variant="ghost" onClick={handleLogout}>
                ÄÄƒng xuáº¥t
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate('/login')}>
              ÄÄƒng nháº­p
            </Button>
          )}

          <Button size="icon" variant="ghost" className="md:hidden" onClick={() => setMobileOpen((v) => !v)}>
            <Icon name={mobileOpen ? 'close' : 'menu'} />
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn(
                  'rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300',
                  isActive ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-800',
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span>{item.label}</span>
                  {item.to === '/messages' && unreadCount > 0 ? (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-white">{unreadCount}</span>
                  ) : null}
                </span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}

export default Header
