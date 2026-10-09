'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getRestaurants, getDishes, getRestaurantReviews, getRestaurantAnalytics } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Store, BookOpen, Image, UtensilsCrossed, ArrowRight, Loader2,
  Star, BarChart3, MousePointerClick, Eye, TrendingUp,
} from 'lucide-react'
import type { Restaurant, Dish, Review, RestaurantAnalytics } from '@/types'
import { formatPrice } from '@/lib/utils'

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const px = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5'
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${px} ${s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
        />
      ))}
    </span>
  )
}

function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  const dist = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            Customer Reviews
          </CardTitle>
          <span className="text-sm text-gray-500">{reviews.length} reviews</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="flex items-start gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900">{avg.toFixed(1)}</p>
            <StarRating rating={Math.round(avg)} size="lg" />
            <p className="mt-1 text-xs text-gray-400">out of 5</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {dist.map(({ n, count }) => (
              <div key={n} className="flex items-center gap-2">
                <span className="w-4 text-right text-xs text-gray-500">{n}</span>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${(count / reviews.length) * 100}%` }}
                  />
                </div>
                <span className="w-4 text-xs text-gray-400">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review list */}
        <div className="divide-y divide-gray-100">
          {reviews.slice(0, 4).map((r) => (
            <div key={r.id} className="py-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#4E6939]/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-[#4E6939]">
                      {r.authorName.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{r.authorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={r.rating} />
                  <span className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
              {r.dietTags && r.dietTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.dietTags.map((t) => (
                    <span key={t} className="rounded-full bg-[#4E6939]/10 px-2 py-0.5 text-xs text-[#4E6939] font-medium capitalize">
                      {t.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function AnalyticsSection({ analytics }: { analytics: RestaurantAnalytics }) {
  const maxClicks = Math.max(...analytics.filterHits.map((h) => h.clicks), 1)
  const typeColors: Record<string, string> = {
    diet: 'bg-[#4E6939]',
    accessibility: 'bg-blue-500',
    cuisine: 'bg-purple-500',
    search: 'bg-amber-500',
  }
  const typeBadge: Record<string, string> = {
    diet: 'bg-[#4E6939]/10 text-[#4E6939]',
    accessibility: 'bg-blue-50 text-blue-700',
    cuisine: 'bg-purple-50 text-purple-700',
    search: 'bg-amber-50 text-amber-700',
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#4E6939]" />
            How Users Find You
          </CardTitle>
          <div className="flex items-center gap-1.5 rounded-full bg-[#4E6939]/10 px-3 py-1">
            <Eye className="h-3.5 w-3.5 text-[#4E6939]" />
            <span className="text-xs font-semibold text-[#4E6939]">{analytics.totalProfileViews} profile views</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filter breakdown */}
        {analytics.filterHits.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <MousePointerClick className="h-3.5 w-3.5" /> Filter &amp; button clicks
            </p>
            {analytics.filterHits.map((hit) => (
              <div key={hit.code} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeBadge[hit.type]}`}>
                      {hit.type === 'diet' ? 'Diet' : hit.type === 'accessibility' ? 'Access.' : hit.type === 'cuisine' ? 'Cuisine' : 'Search'}
                    </span>
                    <span className="text-sm text-gray-700 capitalize">{hit.label.replace('_', ' ')}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{hit.clicks}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${typeColors[hit.type]}`}
                    style={{ width: `${(hit.clicks / maxClicks) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-500">Add dietary or accessibility tags to your restaurant to start tracking filter analytics.</p>
          </div>
        )}

        {/* Top search terms */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> Top search terms
          </p>
          <div className="flex flex-wrap gap-2">
            {analytics.searchTerms.map((t) => (
              <div key={t.term} className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1">
                <span className="text-sm text-gray-700">{t.term}</span>
                <span className="text-xs font-semibold text-[#4E6939]">{t.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
          {Object.entries(typeBadge).map(([type, cls]) => (
            <span key={type} className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
              {type === 'diet' ? 'Diet filter' : type === 'accessibility' ? 'Accessibility filter' : type === 'cuisine' ? 'Cuisine filter' : 'Direct search'}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function RestaurantDashboardPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [analytics, setAnalytics] = useState<RestaurantAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    async function load() {
      try {
        const { restaurants } = await getRestaurants()
        const mine = restaurants.find((r) => r.ownerId === user?.id) ?? restaurants[0] ?? null
        if (mine) {
          setRestaurant(mine)
          const [dishList, reviewList, analyticsData] = await Promise.all([
            getDishes(mine.id),
            getRestaurantReviews(mine.id),
            getRestaurantAnalytics(mine.id),
          ])
          setDishes(dishList)
          setReviews(reviewList)
          setAnalytics(analyticsData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    load()
  // Re-run once user loads from localStorage so restaurant lookup uses the correct owner ID
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#4E6939]" />
      </div>
    )
  }

  const availableDishes = dishes.filter((d) => d.available).length
  const categories = [...new Set(dishes.map((d) => d.category))].length

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-xl bg-gradient-to-r from-[#2D4220] to-[#4E6939] p-6 text-white">
        <h2 className="text-2xl font-bold">
          Welcome back, {user?.displayName ?? 'Owner'}
        </h2>
        {restaurant ? (
          <p className="mt-1 text-white/80">{restaurant.name}</p>
        ) : (
          <p className="mt-1 text-white/80">No restaurant configured yet</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4E6939]/10">
              <UtensilsCrossed className="h-6 w-6 text-[#4E6939]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{dishes.length}</p>
              <p className="text-sm text-gray-500">Total Dishes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{availableDishes}</p>
              <p className="text-sm text-gray-500">Available</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4E6939]/10">
              <Store className="h-6 w-6 text-[#4E6939]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{categories}</p>
              <p className="text-sm text-gray-500">Categories</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            href: '/restaurant/info',
            icon: Store,
            title: 'Restaurant Info',
            desc: 'Edit name, address, hours',
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            href: '/restaurant/menu',
            icon: BookOpen,
            title: 'Manage Menu',
            desc: 'Add, edit or remove dishes',
            color: 'text-[#4E6939]',
            bg: 'bg-[#4E6939]/10',
          },
          {
            href: '/restaurant/media',
            icon: Image,
            title: 'Media',
            desc: 'Add photos and videos',
            color: 'text-pink-600',
            bg: 'bg-pink-50',
          },
        ].map((item) => (
          <Card key={item.href} className="group hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${item.bg}`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
              <Link
                href={item.href}
                className="mt-4 flex items-center gap-1 text-sm font-medium text-[#4E6939] hover:gap-2 transition-all"
              >
                Go to {item.title} <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reviews + Analytics side by side */}
      {restaurant && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ReviewsSection reviews={reviews} />
          {analytics && <AnalyticsSection analytics={analytics} />}
        </div>
      )}

      {/* Recent dishes */}
      {dishes.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Dishes</CardTitle>
              <Link href="/restaurant/menu">
                <Button variant="outline" size="sm">View all</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-100">
              {dishes.slice(0, 5).map((dish) => (
                <div key={dish.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{dish.name}</p>
                    <p className="text-xs text-gray-500">{dish.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice(dish.price)}
                    </span>
                    <Badge variant={dish.available ? 'success' : 'secondary'}>
                      {dish.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
