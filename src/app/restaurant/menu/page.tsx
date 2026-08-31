'use client'

import { useEffect, useState } from 'react'
import { getRestaurants, getDishes, createDish, updateDish, deleteDish } from '@/lib/api'
import { DishForm } from '@/components/forms/DishForm'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import type { Dish, DishFormData } from '@/types'
import { formatPrice } from '@/lib/utils'

export default function MenuPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modals
  const [addOpen, setAddOpen] = useState(false)
  const [editDish, setEditDish] = useState<Dish | null>(null)
  const [deleteDishTarget, setDeleteDishTarget] = useState<Dish | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const user = (await import('@/lib/auth')).getUser()
        const restaurants = await getRestaurants()
        // Prefer an explicit ownerId match; fall back to first result only when
        // the backend already scopes the list to the authenticated owner.
        const mine =
          restaurants.find((r) => r.ownerId === user?.id) ??
          (restaurants.length === 1 ? restaurants[0] : null)
        if (mine) {
          setRestaurantId(mine.id)
          const list = await getDishes(mine.id)
          setDishes(list)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleAddDish(data: DishFormData) {
    if (!restaurantId) return
    setFormLoading(true)
    try {
      const dish = await createDish(restaurantId, data)
      setDishes((prev) => [...prev, dish])
      setAddOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create dish')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleEditDish(data: DishFormData) {
    if (!restaurantId || !editDish) return
    setFormLoading(true)
    try {
      const updated = await updateDish(restaurantId, editDish.id, data)
      setDishes((prev) => prev.map((d) => (d.id === editDish.id ? updated : d)))
      setEditDish(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update dish')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDeleteDish() {
    if (!restaurantId || !deleteDishTarget) return
    setDeleteLoading(true)
    try {
      await deleteDish(restaurantId, deleteDishTarget.id)
      setDishes((prev) => prev.filter((d) => d.id !== deleteDishTarget.id))
      setDeleteDishTarget(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete dish')
    } finally {
      setDeleteLoading(false)
    }
  }

  async function handleToggleAvailable(dish: Dish) {
    if (!restaurantId) return
    try {
      const updated = await updateDish(restaurantId, dish.id, { available: !dish.available })
      setDishes((prev) => prev.map((d) => (d.id === dish.id ? updated : d)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability')
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#4E6939]" />
      </div>
    )
  }

  if (!restaurantId) {
    return (
      <div className="rounded-xl bg-yellow-50 p-6 text-yellow-700">
        No restaurant is assigned to your account. Contact an administrator.
      </div>
    )
  }

  const groupedByCategory = dishes.reduce<Record<string, Dish[]>>((acc, dish) => {
    const cat = dish.category ?? 'Uncategorized'
    acc[cat] = acc[cat] ? [...acc[cat], dish] : [dish]
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{dishes.length} dishes total</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" /> Add Dish
        </Button>
      </div>

      {dishes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-gray-500">No dishes yet. Add your first dish!</p>
            <Button className="mt-4" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" /> Add Dish
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByCategory).map(([category, categoryDishes]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {category}
                  <Badge variant="secondary">{categoryDishes.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-gray-100">
                  {categoryDishes.map((dish) => (
                    <div key={dish.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        {dish.imageUrl && (
                          <img
                            src={dish.imageUrl}
                            alt={dish.name}
                            className="h-10 w-10 rounded-lg object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{dish.name}</p>
                          {dish.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">{dish.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">
                          {formatPrice(dish.price)}
                        </span>
                        <button
                          onClick={() => handleToggleAvailable(dish)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            dish.available ? 'bg-[#4E6939]' : 'bg-gray-200'
                          }`}
                          aria-label={dish.available ? 'Mark unavailable' : 'Mark available'}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                              dish.available ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditDish(dish)}
                          aria-label="Edit dish"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteDishTarget(dish)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          aria-label="Delete dish"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Dish">
        <DishForm
          onSubmit={handleAddDish}
          onCancel={() => setAddOpen(false)}
          loading={formLoading}
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editDish}
        onClose={() => setEditDish(null)}
        title="Edit Dish"
      >
        {editDish && (
          <DishForm
            initial={editDish}
            onSubmit={handleEditDish}
            onCancel={() => setEditDish(null)}
            submitLabel="Save Changes"
            loading={formLoading}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteDishTarget}
        onClose={() => setDeleteDishTarget(null)}
        onConfirm={handleDeleteDish}
        title="Delete Dish"
        description={`Are you sure you want to delete "${deleteDishTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </div>
  )
}
