'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getRestaurants, createRestaurant, deleteRestaurant, getUsers } from '@/lib/api'
import { RestaurantForm } from '@/components/forms/RestaurantForm'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Plus, Pencil, Trash2, Loader2, MapPin, Phone, Globe, User } from 'lucide-react'
import type { Restaurant, RestaurantFormData, User as UserType } from '@/types'

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [owners, setOwners] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Restaurant | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const [list, usersData] = await Promise.all([
        getRestaurants(),
        getUsers(1, 100),
      ])
      setRestaurants(list)
      setOwners(usersData.users.filter((u) => u.role === 'RESTAURANT_OWNER'))
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(data: RestaurantFormData) {
    setCreating(true)
    setCreateError('')
    try {
      const restaurant = await createRestaurant(data)
      setRestaurants((prev) => [restaurant, ...prev])
      setCreateOpen(false)   // only close on success
    } catch (err) {
      // keep modal open, show error inside it
      setCreateError(err instanceof Error ? err.message : 'Failed to create restaurant')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    setDeleteError('')
    try {
      await deleteRestaurant(deleteTarget.id)
      setRestaurants((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete restaurant')
    } finally {
      setDeleteLoading(false)
    }
  }

  function openCreate() {
    setCreateError('')
    setCreateOpen(true)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#4E6939]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {pageError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{pageError}</div>
      )}
      {deleteError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{deleteError}</div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}</p>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Restaurant
        </Button>
      </div>

      {restaurants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <p className="text-gray-500">No restaurants yet.</p>
            <Button className="mt-4" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add Restaurant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => {
            const ownerName = owners.find((u) => u.id === r.ownerId)
            return (
              <Card key={r.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">{r.name}</CardTitle>
                  {r.cuisine && (
                    <span className="inline-block w-fit rounded-full bg-[#4E6939]/10 px-2.5 py-0.5 text-xs text-[#4E6939]">
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
                      <a href={r.website} target="_blank" rel="noopener noreferrer"
                        className="text-[#4E6939] hover:underline truncate">{r.website}</a>
                    </div>
                  )}
                  {ownerName && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{ownerName.displayName || ownerName.email}</span>
                    </div>
                  )}
                  <div className="flex justify-end gap-2 pt-2">
                    <Link href={`/admin/restaurants/${r.id}`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                    </Link>
                    <Button variant="destructive" size="sm" onClick={() => { setDeleteError(''); setDeleteTarget(r) }}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create modal — stays open on error */}
      <Modal
        open={createOpen}
        onClose={() => { setCreateOpen(false); setCreateError('') }}
        title="Add Restaurant"
        description="Fill in the details. Fields marked * are required."
        className="max-w-2xl"
      >
        <RestaurantForm
          owners={owners}
          onSubmit={handleCreate}
          onCancel={() => { setCreateOpen(false); setCreateError('') }}
          submitLabel="Create Restaurant"
          loading={creating}
          error={createError}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Restaurant"
        description={`Delete "${deleteTarget?.name}" and all its data? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </div>
  )
}
