'use client'

import { useEffect, useState } from 'react'
import { getAdminStats } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Users, UtensilsCrossed, CalendarDays, Loader2 } from 'lucide-react'

interface Stats {
  users: number
  restaurants: number
  events: number
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
      <div className="rounded-xl bg-gradient-to-r from-[#4E6939] to-[#8B7EE8] p-6 text-white">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <p className="mt-1 text-white/80">Overview of the Yummy platform</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Stats cards */}
      <div className="grid gap-6 sm:grid-cols-3">
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
          icon={CalendarDays}
          label="Events"
          value={stats?.events ?? 0}
          color="text-green-600"
          bg="bg-green-50"
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
