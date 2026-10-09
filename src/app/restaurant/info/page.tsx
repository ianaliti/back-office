'use client'

import { useEffect, useState } from 'react'
import { getRestaurants, updateRestaurant } from '@/lib/api'
import { RestaurantForm } from '@/components/forms/RestaurantForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Loader2, CheckCircle2 } from 'lucide-react'
import type { Restaurant, RestaurantFormData } from '@/types'

export default function RestaurantInfoPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const user = (await import('@/lib/auth')).getUser()
        const { restaurants } = await getRestaurants()
        const mine =
          restaurants.find((r) => r.ownerId === user?.id) ??
          (restaurants.length === 1 ? restaurants[0] : null)
        setRestaurant(mine)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load restaurant')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSubmit(data: RestaurantFormData) {
    if (!restaurant) return
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const updated = await updateRestaurant(restaurant.id, data)
      setRestaurant(updated)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#4E6939]" />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="rounded-xl bg-yellow-50 p-6 text-yellow-700">
        No restaurant found for your account.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Information</CardTitle>
          <CardDescription>
            Update your restaurant details visible to customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Restaurant information saved successfully.
            </div>
          )}
          <RestaurantForm
            initial={restaurant}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            loading={saving}
          />
        </CardContent>
      </Card>
    </div>
  )
}
