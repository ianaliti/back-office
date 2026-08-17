'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getRestaurants, getDishes } from '@/lib/api'
import { getUser } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Store, BookOpen, Image, UtensilsCrossed, ArrowRight, Loader2 } from 'lucide-react'
import type { Restaurant, Dish } from '@/types'
import { formatPrice } from '@/lib/utils'

export default function RestaurantDashboardPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const user = getUser()

  useEffect(() => {
    async function load() {
      try {
        const restaurants = await getRestaurants()
        const mine = restaurants.find((r) => r.ownerId === user?.id) ?? restaurants[0] ?? null
        if (mine) {
          setRestaurant(mine)
          const dishList = await getDishes(mine.id)
          setDishes(dishList)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
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
