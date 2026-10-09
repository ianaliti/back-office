'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { clearAuth } from '@/lib/auth'
import { useAuth } from '@/context/AuthContext'
import * as api from '@/lib/api'
import {
  LayoutDashboard,
  Store,
  BookOpen,
  Image,
  Users,
  BarChart3,
  Leaf,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
} from 'lucide-react'
import { useState } from 'react'
import type { UserRole } from '@/types'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const restaurantNav: NavItem[] = [
  { label: 'Dashboard', href: '/restaurant/dashboard', icon: LayoutDashboard },
  { label: 'Restaurant Info', href: '/restaurant/info', icon: Store },
  { label: 'Menu', href: '/restaurant/menu', icon: UtensilsCrossed },
  { label: 'Media', href: '/restaurant/media', icon: Image },
]

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
  { label: 'Restaurants', href: '/admin/restaurants', icon: Store },
  { label: 'Users', href: '/admin/users', icon: Users },
]

interface SidebarProps {
  role: UserRole
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const { user } = useAuth()
  const navItems = role === 'ADMIN' ? adminNav : restaurantNav

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await api.logout()
    } catch {
      clearAuth()
    } finally {
      setLoggingOut(false)
      router.push('/login')
    }
  }

  return (
    <aside
      className={cn(
        'flex h-screen flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
      style={{ background: '#2D4220', color: '#D4E0CB' }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: '#4E6939' }}>
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Yummy</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1.5 transition-colors"
          style={{ color: '#8FA87A' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-3">
          <span className="rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide" style={{ background: '#4E6939', color: '#D4E0CB' }}>
            {role === 'ADMIN' ? 'Admin' : 'Restaurant'}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  )}
                  style={{
                    background: isActive ? '#4E6939' : 'transparent',
                    color: isActive ? '#ffffff' : '#A8C09A',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User / Logout */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {!collapsed && user && (
          <div className="mb-3 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-medium text-white truncate">{user.displayName || user.email}</p>
            <p className="text-xs truncate" style={{ color: '#8FA87A' }}>{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          style={{ color: '#8FA87A' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#fca5a5' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8FA87A' }}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{loggingOut ? 'Logging out…' : 'Logout'}</span>}
        </button>
      </div>
    </aside>
  )
}
