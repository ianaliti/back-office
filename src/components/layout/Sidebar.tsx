'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { clearAuth, getUser } from '@/lib/auth'
import * as api from '@/lib/api'
import {
  LayoutDashboard,
  Store,
  BookOpen,
  Image,
  Users,
  BarChart3,
  UtensilsCrossed,
  LogOut,
  ChevronLeft,
  ChevronRight,
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
  { label: 'Menu', href: '/restaurant/menu', icon: BookOpen },
  { label: 'Media', href: '/restaurant/media', icon: Image },
]

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
  { label: 'Restaurants', href: '/admin/restaurants', icon: UtensilsCrossed },
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
  const user = getUser()
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
        'flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#685ED7]">
              <UtensilsCrossed className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Yummy</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#685ED7]/10 text-[#685ED7]'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-[#685ED7]')} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User / Logout */}
      <div className="border-t border-gray-100 p-4">
        {!collapsed && user && (
          <div className="mb-3 rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-900 truncate">{user.displayName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-[#685ED7]/10 px-2 py-0.5 text-xs text-[#685ED7] font-medium">
              {user.role}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600',
            'hover:bg-red-50 hover:text-red-600 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>}
        </button>
      </div>
    </aside>
  )
}
