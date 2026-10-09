'use client'

import { useEffect, useState } from 'react'
import { getMyRestaurant, getDishes, getRestaurantReviews, getRestaurantAnalytics } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Star, Loader2 } from 'lucide-react'
import type { Restaurant, Dish, Review } from '@/types'

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
const FAKE_VISITS = [42, 58, 75, 63, 90, 110, 98, 85, 72, 60, 88, 104]

export default function RestaurantDashboardPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    async function load() {
      try {
        const mine = await getMyRestaurant().catch(() => null)
        if (mine) {
          setRestaurant(mine)
          const [dishList, reviewList] = await Promise.all([
            getDishes(mine.id),
            getRestaurantReviews(mine.id).catch(() => []),
            getRestaurantAnalytics(mine.id).catch(() => null),
          ])
          setDishes(dishList)
          setReviews(reviewList)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#4E6939' }} />
      </div>
    )
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'
  const positiveRate = reviews.length
    ? Math.round((reviews.filter((r) => r.rating >= 4).length / reviews.length) * 100)
    : 0
  const availableDishes = dishes.filter((d) => d.available).length
  const maxVisit = Math.max(...FAKE_VISITS)
  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'Chef'

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
          {error}
        </div>
      )}

      {/* Hero banner with inline stats */}
      <div
        className="rounded-xl px-7 py-6"
        style={{ background: '#2D3B1F' }}
      >
        <p className="text-xs font-medium" style={{ color: '#C8E86A' }}>
          {restaurant?.name ?? 'Mon restaurant'}
        </p>
        <h2 className="mt-1 text-2xl font-bold text-white">
          Bonjour, {displayName} 👋
        </h2>
        <p className="mt-1 text-sm" style={{ color: '#8FA87A' }}>
          Gérez votre restaurant depuis votre espace dédié.
        </p>

        {/* Stat row */}
        <div
          className="mt-5 grid grid-cols-4 gap-0 rounded-xl overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.18)' }}
        >
          {[
            { value: dishes.length, label: 'Plats au total' },
            { value: availableDishes, label: 'Plats actifs' },
            { value: avgRating, label: 'Note moyenne' },
            { value: reviews.length ? `${positiveRate} %` : '— %', label: 'Avis positifs' },
          ].map((stat, i) => (
            <div
              key={i}
              className="px-5 py-4"
              style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}
            >
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="mt-0.5 text-[11px]" style={{ color: '#8FA87A' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Bar chart */}
        <div
          className="col-span-2 rounded-xl bg-white p-6"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
        >
          <p className="mb-4 text-sm font-semibold" style={{ color: '#111827' }}>
            Statistiques de fréquentation
          </p>
          <div className="flex items-end gap-2" style={{ height: 140 }}>
            {FAKE_VISITS.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${(v / maxVisit) * 120}px`,
                    background: '#4E6939',
                    opacity: 0.75 + (v / maxVisit) * 0.25,
                  }}
                />
                <span className="text-[9px]" style={{ color: '#9CA3AF' }}>
                  {MONTHS[i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div
          className="rounded-xl bg-white p-5"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
        >
          <p className="mb-4 text-sm font-semibold" style={{ color: '#111827' }}>
            Activité récente
          </p>
          {dishes.length === 0 ? (
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Aucun plat encore ajouté.</p>
          ) : (
            <ul className="space-y-3">
              {dishes.slice(0, 5).map((d) => (
                <li key={d.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium" style={{ color: '#111827' }}>
                      {d.name}
                    </p>
                    <p className="text-[10px]" style={{ color: '#9CA3AF' }}>{d.category}</p>
                  </div>
                  <span
                    className="ml-3 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={
                      d.available
                        ? { background: 'rgba(200,232,106,0.25)', color: '#2D3B1F' }
                        : { background: '#F3F4F6', color: '#9CA3AF' }
                    }
                  >
                    {d.available ? 'Dispo' : 'Indispo'}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Tip card */}
          <div
            className="mt-5 rounded-xl p-4"
            style={{ background: 'rgba(200,232,106,0.18)' }}
          >
            <p className="text-xs font-semibold" style={{ color: '#2D3B1F' }}>
              Bon plan du moment
            </p>
            <p className="mt-1 text-[11px]" style={{ color: '#4E6939' }}>
              Complétez votre carte avec des photos pour attirer plus de clients.
            </p>
          </div>
        </div>
      </div>

      {/* Reviews preview */}
      {reviews.length > 0 && (
        <div
          className="rounded-xl bg-white p-5"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
        >
          <p className="mb-4 text-sm font-semibold" style={{ color: '#111827' }}>
            Derniers avis
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="rounded-lg p-3"
                style={{ background: '#F9F8F5' }}
              >
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="h-3 w-3"
                      style={s <= r.rating
                        ? { fill: '#F59E0B', color: '#F59E0B' }
                        : { fill: '#E5E7EB', color: '#E5E7EB' }
                      }
                    />
                  ))}
                </div>
                <p className="text-xs font-medium" style={{ color: '#111827' }}>{r.authorName}</p>
                <p className="mt-1 text-[11px] line-clamp-2" style={{ color: '#6B7280' }}>
                  {r.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
