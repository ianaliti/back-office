'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout role="ADMIN">{children}</DashboardLayout>
}
