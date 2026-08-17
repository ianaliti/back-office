'use client'

import { usePathname } from 'next/navigation'

const pageTitles: Record<string, string> = {
  '/restaurant/dashboard': 'Dashboard',
  '/restaurant/info': 'Restaurant Info',
  '/restaurant/menu': 'Menu Management',
  '/restaurant/media': 'Media',
  '/admin/dashboard': 'Admin Dashboard',
  '/admin/restaurants': 'Restaurants',
  '/admin/users': 'Users',
}

function getTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]
  if (pathname.startsWith('/admin/restaurants/')) return 'Edit Restaurant'
  return 'Back Office'
}

export function Header() {
  const pathname = usePathname()
  const title = getTitle(pathname)

  return (
    <header className="flex h-16 items-center border-b border-gray-200 bg-white px-6">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
    </header>
  )
}
