import { Sidebar } from './Sidebar'
import { Header } from './Header'
import type { UserRole } from '@/types'
import type { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
  role: UserRole
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
