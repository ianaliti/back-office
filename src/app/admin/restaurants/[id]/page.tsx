'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getRestaurant, updateRestaurant } from '@/lib/api'
import { RestaurantForm } from '@/components/forms/RestaurantForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import type { Restaurant, RestaurantFormData } from '@/types'

export default function EditRestaurantPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await getRestaurant(id)
        setRestaurant(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load restaurant')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

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
        <Loader2 className="h-8 w-8 animate-spin text-[#685ED7]" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Restaurants
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{restaurant?.name ?? 'Edit Restaurant'}</CardTitle>
          <CardDescription>Update the restaurant information</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Restaurant updated successfully.
            </div>
          )}
          {restaurant ? (
            <RestaurantForm
              initial={restaurant}
              onSubmit={handleSubmit}
              submitLabel="Save Changes"
              loading={saving}
            />
          ) : (
            <p className="text-gray-500">Restaurant not found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
