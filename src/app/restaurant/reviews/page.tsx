'use client'

import { useEffect, useState } from 'react'
import { getMyRestaurant, getRestaurantReviews } from '@/lib/api'
import { Loader2, Star, MessageSquare } from 'lucide-react'
import type { Restaurant, Review } from '@/types'

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className="h-3.5 w-3.5"
          style={s <= rating
            ? { fill: '#F59E0B', color: '#F59E0B' }
            : { fill: '#E5E7EB', color: '#E5E7EB' }
          }
        />
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const mine = await getMyRestaurant()
        setRestaurant(mine)
        if (mine) {
          const list = await getRestaurantReviews(mine.id).catch(() => [])
          setReviews(list)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#4E6939' }} />
      </div>
    )
  }

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0
  const dist = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
  }))

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
          {error}
        </div>
      )}

      {reviews.length === 0 ? (
        <div
          className="flex flex-col items-center py-20 rounded-xl bg-white gap-3"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
        >
          <MessageSquare className="h-10 w-10" style={{ color: '#D1D5DB' }} />
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Aucun avis pour le moment.</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div
            className="rounded-xl bg-white p-6"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
          >
            <div className="flex items-start gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold" style={{ color: '#111827' }}>{avg.toFixed(1)}</p>
                <StarRow rating={Math.round(avg)} />
                <p className="mt-1 text-xs" style={{ color: '#9CA3AF' }}>{reviews.length} avis</p>
              </div>
              <div className="flex-1 space-y-2">
                {dist.map(({ n, count }) => (
                  <div key={n} className="flex items-center gap-2">
                    <span className="w-4 text-right text-xs" style={{ color: '#6B7280' }}>{n}</span>
                    <Star className="h-3 w-3 shrink-0" style={{ fill: '#F59E0B', color: '#F59E0B' }} />
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%',
                          background: '#4E6939',
                        }}
                      />
                    </div>
                    <span className="w-5 text-xs" style={{ color: '#9CA3AF' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Review cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-xl bg-white p-4"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                      style={{ background: 'rgba(200,232,106,0.25)', color: '#2D3B1F' }}
                    >
                      {r.authorName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#111827' }}>
                      {r.authorName}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>
                    {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <StarRow rating={r.rating} />
                <p className="mt-2 text-xs leading-relaxed line-clamp-3" style={{ color: '#6B7280' }}>
                  {r.comment}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
