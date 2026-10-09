'use client'

import { usePathname } from 'next/navigation'
import { Bell, Search } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const pageTitles: Record<string, string> = {
  '/restaurant/dashboard': 'Tableau de bord',
  '/restaurant/allergens': 'Carte & allergènes',
  '/restaurant/fiche': 'Fiche publique',
  '/restaurant/reservations': 'Réservations',
  '/restaurant/reviews': 'Avis clients',
  '/restaurant/badge': 'Badge & certification',
  '/restaurant/settings': 'Paramètres',
  '/admin/dashboard': 'Dashboard',
  '/admin/restaurants': 'Restaurants',
  '/admin/users': 'Utilisateurs',
}

function getTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]
  if (pathname.startsWith('/admin/restaurants/')) return 'Modifier le restaurant'
  if (pathname.startsWith('/restaurant/allergens/')) return 'Carte & allergènes'
  return 'Back Office'
}

export function Header() {
  const pathname = usePathname()
  const { user } = useAuth()
  const title = getTitle(pathname)
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'YB'
  const showSearch = pathname === '/restaurant/allergens' || pathname === '/restaurant/fiche'

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between px-6"
      style={{ background: '#fff', borderBottom: '1px solid #E5E0D8' }}
    >
      <h1 className="text-base font-semibold" style={{ color: '#111827' }}>{title}</h1>
      {showSearch && (
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-1.5"
          style={{ background: '#F2EDE4', border: '1px solid #E5E0D8', minWidth: 260 }}
        >
          <Search className="h-3.5 w-3.5 shrink-0" style={{ color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Rechercher un plat, client…"
            className="bg-transparent text-sm outline-none w-full"
            style={{ color: '#6B7280' }}
          />
        </div>
      )}
      <div className="flex items-center gap-3">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
          style={{ color: '#6B7280' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F2EDE4')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
          style={{ background: '#4E6939', color: '#C8E86A' }}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
