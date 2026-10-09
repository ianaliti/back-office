'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { clearAuth, getUser } from '@/lib/auth'
import { useAuth } from '@/context/AuthContext'
import * as api from '@/lib/api'
import {
  LayoutDashboard,
  Store,
  BookOpen,
  CalendarDays,
  Star,
  Award,
  Settings,
  Leaf,
  LogOut,
  Bell,
  HelpCircle,
  ExternalLink,
  FileText,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navItems = [
  { label: 'Tableau de bord', href: '/restaurant/dashboard', icon: LayoutDashboard },
  { label: 'Carte & allergènes', href: '/restaurant/allergens', icon: BookOpen },
  { label: 'Fiche publique', href: '/restaurant/fiche', icon: FileText },
  { label: 'Réservations', href: '/restaurant/reservations', icon: CalendarDays },
  { label: 'Avis clients', href: '/restaurant/reviews', icon: Star },
  { label: 'Badge & certification', href: '/restaurant/badge', icon: Award },
  { label: 'Paramètres', href: '/restaurant/settings', icon: Settings },
]

const adminNavItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Restaurants', href: '/admin/restaurants', icon: Store },
  { label: 'Utilisateurs', href: '/admin/users', icon: Star },
]

interface SidebarProps {
  role: 'ADMIN' | 'RESTAURANT_OWNER' | string
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const { user } = useAuth()
  const [restaurantName, setRestaurantName] = useState<string>('')

  useEffect(() => {
    if (role === 'ADMIN') return
    api.getMyRestaurant()
      .then((r) => setRestaurantName(r.name))
      .catch(() => {/* silently ignore — name stays empty */})
  }, [role])

  const items = role === 'ADMIN' ? adminNavItems : navItems

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'YB'

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
      className="flex h-screen flex-col shrink-0"
      style={{ width: 220, background: '#2D3B1F', color: '#D4E0CB' }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-between px-4 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{ background: '#4E6939' }}
          >
            <Leaf className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white">yum'nut</span>
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold"
            style={{ background: '#C8E86A', color: '#1A2E0A' }}
          >
            bo
          </span>
        </div>
        <button
          className="rounded p-1 transition-colors"
          style={{ color: '#8FA87A' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#C8E86A')}
          onMouseLeave={e => (e.currentTarget.style.color = '#8FA87A')}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>

      {/* Restaurant name */}
      {role !== 'ADMIN' && (
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
              style={{ background: '#4E6939', color: '#C8E86A' }}
            >
              {restaurantName ? restaurantName.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                {restaurantName || 'Mon restaurant'}
              </p>
              <p className="text-[10px]" style={{ color: '#8FA87A' }}>Restaurant</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all',
                  )}
                  style={{
                    background: isActive ? '#C8E86A' : 'transparent',
                    color: isActive ? '#1A2E0A' : '#8FA87A',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer nav */}
      {role !== 'ADMIN' && (
        <div className="px-2 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { label: 'Aide & support', icon: HelpCircle, href: '#' },
            { label: "Ma fiche dans l'app", icon: ExternalLink, href: '#' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium"
              style={{ color: '#8FA87A' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </a>
          ))}
        </div>
      )}

      {/* User */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
            style={{ background: '#4E6939', color: '#C8E86A' }}
          >
            {initials}
          </div>
          <p className="truncate text-xs" style={{ color: '#8FA87A' }}>
            {user?.email ?? ''}
          </p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50"
          style={{ color: '#8FA87A' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#fca5a5'
            e.currentTarget.style.background = 'rgba(239,68,68,0.12)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#8FA87A'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>{loggingOut ? 'Déconnexion…' : 'Se déconnecter'}</span>
        </button>
      </div>
    </aside>
  )
}
