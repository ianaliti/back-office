'use client'

import { useEffect, useState } from 'react'
import { getAdminStats } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Users, UtensilsCrossed, ShoppingBag, Star, Loader2 } from 'lucide-react'

interface Stats {
  users: number
  restaurants: number
  orders: number
  reviews: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await getAdminStats()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#4E6939]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl bg-gradient-to-r from-[#2D4220] to-[#4E6939] p-6 text-white">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <p className="mt-1 text-white/80">Overview of the Yummy platform</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Stats cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats?.users ?? 0}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          icon={UtensilsCrossed}
          label="Restaurants"
          value={stats?.restaurants ?? 0}
          color="text-[#4E6939]"
          bg="bg-[#4E6939]/10"
        />
        <StatCard
          icon={ShoppingBag}
          label="Orders"
          value={stats?.orders ?? 0}
          color="text-purple-600"
          bg="bg-purple-50"
        />
        <StatCard
          icon={Star}
          label="Reviews"
          value={stats?.reviews ?? 0}
          color="text-amber-500"
          bg="bg-amber-50"
        />
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  color: string
  bg: string
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${bg}`}>
          <Icon className={`h-7 w-7 ${color}`} />
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
