'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getRestaurants, createRestaurant, deleteRestaurant } from '@/lib/api'
import { RestaurantForm } from '@/components/forms/RestaurantForm'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Plus, Pencil, Trash2, Loader2, MapPin, Phone, Globe } from 'lucide-react'
import type { Restaurant, RestaurantFormData } from '@/types'

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Restaurant | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const list = await getRestaurants()
      setRestaurants(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurants')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(data: RestaurantFormData) {
    setCreating(true)
    setError('')
    try {
      const restaurant = await createRestaurant(data)
      setRestaurants((prev) => [...prev, restaurant])
      setCreateOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create restaurant')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteRestaurant(deleteTarget.id)
      setRestaurants((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete restaurant')
    } finally {
      setDeleteLoading(false)
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
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{restaurants.length} restaurants</p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Add Restaurant
        </Button>
      </div>

      {restaurants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <p className="text-gray-500">No restaurants found.</p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Add Restaurant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <Card key={r.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base">{r.name}</CardTitle>
                {r.cuisine && (
                  <span className="inline-block rounded-full bg-[#685ED7]/10 px-2.5 py-0.5 text-xs text-[#685ED7]">
                    {r.cuisine}
                  </span>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {r.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    <span>{r.address}</span>
                  </div>
                )}
                {r.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{r.phone}</span>
                  </div>
                )}
                {r.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <a
                      href={r.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#685ED7] hover:underline truncate"
                    >
                      {r.website}
                    </a>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Link href={`/admin/restaurants/${r.id}`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteTarget(r)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Restaurant"
        description="Fill in the details for the new restaurant."
        className="max-w-2xl"
      >
        <RestaurantForm
          onSubmit={handleCreate}
          submitLabel="Create Restaurant"
          loading={creating}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Restaurant"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This will permanently remove the restaurant and all its data.`}
        confirmLabel="Delete Restaurant"
        loading={deleteLoading}
      />
    </div>
  )
}
