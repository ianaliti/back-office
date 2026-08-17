'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { ReactNode } from 'react'

export default function RestaurantLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout role="RESTAURANT_OWNER">{children}</DashboardLayout>
}
