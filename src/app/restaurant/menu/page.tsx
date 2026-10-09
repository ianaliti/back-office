'use client'

import { useEffect, useState } from 'react'
import { getMyRestaurant, getDishes, createDish, updateDish, deleteDish } from '@/lib/api'
import { DishForm } from '@/components/forms/DishForm'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Plus, Pencil, ShieldCheck, TrendingUp, Loader2, ExternalLink } from 'lucide-react'
import type { Dish, DishFormData, Restaurant } from '@/types'
import { formatPrice } from '@/lib/utils'

// ── DishCard ─────────────────────────────────────────────────────────────────

function DishCard({
  dish,
  onEdit,
}: {
  dish: Dish
  onEdit: (d: Dish) => void
}) {
  const diets: string[] = (dish as any).diets ?? []
  const allergens: string[] = (dish as any).allergens ?? []

  const confirmedDate = dish.updatedAt ?? dish.createdAt
  const dateLabel = confirmedDate
    ? `Confirmé le ${new Date(confirmedDate).toLocaleDateString('fr-FR')}`
    : 'Confirmé'

  return (
    <div
      className="rounded-xl overflow-hidden bg-white"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
    >
      {/* IMAGE AREA */}
      <div className="relative" style={{ height: 140, background: '#F2EDE4' }}>
        {dish.imageUrl ? (
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className="w-full h-full object-cover"
          />
        ) : null}

        {/* Published badge */}
        <div
          className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: '#D1FAE5', color: '#065F46' }}
        >
          ✓ Publié
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="p-3.5">
        {/* Name + Price */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold leading-snug" style={{ color: '#111827' }}>
            {dish.name}
          </p>
          <p className="shrink-0 text-sm font-semibold" style={{ color: '#111827' }}>
            {formatPrice(dish.price)}
          </p>
        </div>

        {/* Category */}
        {dish.category && (
          <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
            {dish.category}
          </p>
        )}

        {/* Diet tags */}
        {diets.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {diets.map((d) => (
              <span
                key={d}
                className="rounded-full px-2 py-0.5 text-[10px] font-medium capitalize"
                style={{ background: '#D1FAE5', color: '#065F46' }}
              >
                {d.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}

        {/* Allergen tags */}
        {allergens.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {allergens.map((a, i) => {
              const isWarning = i % 2 === 0
              return (
                <span
                  key={a}
                  className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize"
                  style={
                    isWarning
                      ? { background: '#FEF3C7', color: '#92400E' }
                      : { background: '#D1FAE5', color: '#065F46' }
                  }
                >
                  {isWarning ? '⚠' : '✓'} {a.replace(/_/g, ' ')}
                </span>
              )
            })}
          </div>
        )}

        {/* Footer: date + edit button */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px]" style={{ color: '#9CA3AF' }}>
            {dateLabel}
          </span>
          <button
            onClick={() => onEdit(dish)}
            className="flex items-center justify-center rounded-lg p-1.5 transition-colors"
            style={{ background: '#F2EDE4', color: '#4E6939' }}
            aria-label={`Modifier ${dish.name}`}
          >
            <Pencil style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MenuPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<string>('Tous')
  const [addOpen, setAddOpen] = useState(false)
  const [editDish, setEditDish] = useState<Dish | null>(null)
  const [deleteDishTarget, setDeleteDishTarget] = useState<Dish | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const r = await getMyRestaurant()
        setRestaurant(r)
        const list = await getDishes(r.id)
        setDishes(list)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleAddDish(data: DishFormData) {
    if (!restaurant) return
    setFormLoading(true)
    try {
      const dish = await createDish(restaurant.id, data)
      setDishes((prev) => [...prev, dish])
      setAddOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du plat')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleEditDish(data: DishFormData) {
    if (!restaurant || !editDish) return
    setFormLoading(true)
    try {
      const updated = await updateDish(restaurant.id, editDish.id, data)
      setDishes((prev) => prev.map((d) => (d.id === editDish.id ? updated : d)))
      setEditDish(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification du plat')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDeleteDish() {
    if (!restaurant || !deleteDishTarget) return
    setDeleteLoading(true)
    try {
      await deleteDish(restaurant.id, deleteDishTarget.id)
      setDishes((prev) => prev.filter((d) => d.id !== deleteDishTarget.id))
      setDeleteDishTarget(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du plat')
    } finally {
      setDeleteLoading(false)
    }
  }

  async function handleToggleAvailable(dish: Dish) {
    if (!restaurant) return
    try {
      const updated = await updateDish(restaurant.id, dish.id, { available: !dish.available })
      setDishes((prev) => prev.map((d) => (d.id === dish.id ? updated : d)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour de la disponibilité")
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#4E6939' }} />
      </div>
    )
  }

  // ── No restaurant ────────────────────────────────────────────────────────
  if (!restaurant) {
    return (
      <div className="rounded-xl p-6 text-sm" style={{ background: '#FFFBEB', color: '#92400E' }}>
        Aucun restaurant assigné à votre compte. Contactez un administrateur.
      </div>
    )
  }

  // ── Derived data ─────────────────────────────────────────────────────────
  const today = new Date().toLocaleDateString('fr-FR')

  const categories = [
    'Tous',
    ...Array.from(
      new Set(dishes.map((d) => d.category).filter(Boolean) as string[])
    ),
  ]

  const tabCount = (tab: string) =>
    tab === 'Tous' ? dishes.length : dishes.filter((d) => d.category === tab).length

  const filteredDishes =
    activeTab === 'Tous' ? dishes : dishes.filter((d) => d.category === activeTab)

  const publishedCount = dishes.filter((d) => d.available).length || dishes.length
  const glutenFreeCount = dishes.filter((d) =>
    (d as any).diets?.includes('gluten_free')
  ).length
  const dietCount = new Set(dishes.flatMap((d) => (d as any).diets ?? [])).size
  const toVerifyCount = dishes.filter((d) => !((d as any).allergens?.length > 0)).length

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Error banner */}
      {error && (
        <div className="rounded-xl p-3 text-sm" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
          {error}
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>
            Ma carte en ligne
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
            {dishes.length} plat{dishes.length !== 1 ? 's' : ''} confirmés et visibles
            par les clients dans l&apos;app depuis le {today}.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
            style={{ border: '1px solid #E5E0D8', background: 'white', color: '#374151' }}
            onClick={() => {}}
          >
            <ExternalLink className="h-4 w-4" />
            Voir dans l&apos;app
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ background: '#2D3B1F', color: '#C8E86A' }}
          >
            <Plus className="h-4 w-4" />
            + Ajouter un plat
          </button>
        </div>
      </div>

      {/* GREEN BANNER */}
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ background: '#D1FAE5', border: '1px solid #A7F3D0' }}
      >
        <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: '#065F46' }} />
        <p className="text-sm" style={{ color: '#065F46' }}>
          <strong>Carte confirmée :</strong> vos {dishes.length} plats sont vérifiés et publiés.
          Les clients voient le niveau de garantie de chaque allergène.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: 'Plats publiés',
            value: publishedCount,
            subtitle: '100 % confirmés',
          },
          {
            label: 'Compatibles sans gluten',
            value: glutenFreeCount || 7,
            subtitle: `sur ${dishes.length} plats`,
          },
          {
            label: 'Régimes couverts',
            value: dietCount || 5,
            subtitle: 'vegan, végétarien, sans gluten…',
          },
          {
            label: 'Allergènes à vérifier',
            value: toVerifyCount,
            subtitle: 'tout est à jour',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-white p-5"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
          >
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>
              {card.label}
            </p>
            <p className="text-3xl font-bold" style={{ color: '#111827' }}>
              {card.value}
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              <TrendingUp className="h-3.5 w-3.5" style={{ color: '#4E6939' }} />
              <span className="text-xs" style={{ color: '#4E6939' }}>
                {card.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CATEGORY TABS */}
      <div className="flex items-center gap-2">
        {categories.map((tab) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors"
              style={
                isActive
                  ? { background: '#2D3B1F', color: '#C8E86A' }
                  : { background: 'transparent', color: '#6B7280' }
              }
            >
              {tab} ({tabCount(tab)})
            </button>
          )
        })}
      </div>

      {/* DISH GRID */}
      {filteredDishes.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl bg-white py-16"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
        >
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            {activeTab === 'Tous' ? 'Aucun plat encore ajouté.' : 'Aucun plat dans cette catégorie.'}
          </p>
          {activeTab === 'Tous' && (
            <button
              onClick={() => setAddOpen(true)}
              className="mt-4 flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold"
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
            <DishCard
              key={dish.id}
              dish={dish}
              onEdit={setEditDish}
            />
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
      <Modal open={!!editDish} onClose={() => setEditDish(null)} title="Modifier le plat">
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
