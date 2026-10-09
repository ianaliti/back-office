'use client'

import { useEffect, useState } from 'react'
import { getRestaurants, getDishes, createDish, updateDish, deleteDish } from '@/lib/api'
import { DishForm } from '@/components/forms/DishForm'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Plus, Pencil, Trash2, Loader2, ImageOff } from 'lucide-react'
import type { Dish, DishFormData } from '@/types'
import { formatPrice } from '@/lib/utils'

type TabKey = 'ALL' | 'ACTIVE' | 'INACTIVE'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ALL', label: 'Tous' },
  { key: 'ACTIVE', label: 'Actifs' },
  { key: 'INACTIVE', label: 'Inactifs' },
]

export default function MenuPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('ALL')

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
        const { restaurants } = await getRestaurants()
        const mine =
          restaurants.find((r) => r.ownerId === user?.id) ??
          (restaurants.length === 1 ? restaurants[0] : null)
        if (mine) {
          setRestaurantId(mine.id)
          const list = await getDishes(mine.id)
          setDishes(list)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
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
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du plat')
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
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification du plat')
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
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du plat')
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
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour de la disponibilité")
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#4E6939' }} />
      </div>
    )
  }

  if (!restaurantId) {
    return (
      <div className="rounded-xl p-6 text-sm" style={{ background: '#FFFBEB', color: '#92400E' }}>
        Aucun restaurant assigné à votre compte. Contactez un administrateur.
      </div>
    )
  }

  const activeDishes = dishes.filter((d) => d.available)
  const inactiveDishes = dishes.filter((d) => !d.available)

  const tabCounts: Record<TabKey, number> = {
    ALL: dishes.length,
    ACTIVE: activeDishes.length,
    INACTIVE: inactiveDishes.length,
  }

  const filteredDishes =
    activeTab === 'ACTIVE'
      ? activeDishes
      : activeTab === 'INACTIVE'
      ? inactiveDishes
      : dishes

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl p-3 text-sm" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
          {error}
        </div>
      )}

      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Tab pills */}
        <div
          className="flex items-center rounded-xl p-1"
          style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: isActive ? '#2D3B1F' : 'transparent',
                  color: isActive ? '#C8E86A' : '#6B7280',
                }}
              >
                {tab.label}
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                  style={
                    isActive
                      ? { background: 'rgba(200,232,106,0.2)', color: '#C8E86A' }
                      : { background: '#F3F4F6', color: '#9CA3AF' }
                  }
                >
                  {tabCounts[tab.key]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Add button */}
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition"
          style={{ background: '#2D3B1F', color: '#C8E86A' }}
        >
          <Plus className="h-4 w-4" />
          Ajouter un plat
        </button>
      </div>

      {/* Empty state */}
      {filteredDishes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
          <ImageOff className="h-10 w-10 mb-3" style={{ color: '#D1D5DB' }} />
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            {activeTab === 'ALL' ? 'Aucun plat encore ajouté.' : 'Aucun plat dans cette catégorie.'}
          </p>
          {activeTab === 'ALL' && (
            <button
              onClick={() => setAddOpen(true)}
              className="mt-4 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ background: '#2D3B1F', color: '#C8E86A' }}
            >
              <Plus className="h-4 w-4" />
              Ajouter un plat
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              className="rounded-xl overflow-hidden bg-white"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
            >
              {/* Image area */}
              <div
                className="relative h-40 flex items-center justify-center"
                style={{ background: '#F2EDE4' }}
              >
                {dish.imageUrl ? (
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        const icon = parent.querySelector('[data-fallback]') as HTMLElement | null
                        if (icon) icon.style.display = 'flex'
                      }
                    }}
                  />
                ) : null}
                {!dish.imageUrl && (
                  <ImageOff className="h-8 w-8" style={{ color: '#C5BDB2' }} />
                )}

                {/* Availability toggle */}
                <button
                  onClick={() => handleToggleAvailable(dish)}
                  className="absolute right-2 top-2 flex h-5 w-9 items-center rounded-full transition-colors"
                  style={{ background: dish.available ? '#4E6939' : '#D1D5DB' }}
                  aria-label={dish.available ? 'Marquer indisponible' : 'Marquer disponible'}
                  aria-checked={dish.available}
                  role="switch"
                >
                  <span
                    className="inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform"
                    style={{ transform: dish.available ? 'translateX(20px)' : 'translateX(4px)' }}
                  />
                </button>
              </div>

              {/* Info area */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>
                    {dish.name}
                  </p>
                  <p className="shrink-0 text-sm font-bold" style={{ color: '#4E6939' }}>
                    {formatPrice(dish.price)}
                  </p>
                </div>

                {dish.category && (
                  <span
                    className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ background: 'rgba(200,232,106,0.3)', color: '#2D3B1F' }}
                  >
                    {dish.category}
                  </span>
                )}

                {dish.description && (
                  <p
                    className="mt-1.5 text-xs line-clamp-2"
                    style={{ color: '#9CA3AF' }}
                  >
                    {dish.description}
                  </p>
                )}

                {/* Actions */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => setEditDish(dish)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition"
                    style={{ background: '#F2EDE4', color: '#4E6939' }}
                    aria-label={`Modifier ${dish.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Modifier
                  </button>
                  <button
                    onClick={() => setDeleteDishTarget(dish)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition"
                    style={{ background: '#FEF2F2' }}
                    aria-label={`Supprimer ${dish.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" style={{ color: '#EF4444' }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Ajouter un plat">
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
        title="Modifier le plat"
      >
        {editDish && (
          <DishForm
            initial={editDish}
            onSubmit={handleEditDish}
            onCancel={() => setEditDish(null)}
            submitLabel="Enregistrer"
            loading={formLoading}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteDishTarget}
        onClose={() => setDeleteDishTarget(null)}
        onConfirm={handleDeleteDish}
        title="Supprimer le plat"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteDishTarget?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        loading={deleteLoading}
      />
    </div>
  )
}
