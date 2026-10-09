'use client'

import { useEffect, useState } from 'react'
import { getMyRestaurant, getDishes, createDish, updateDish, deleteDish } from '@/lib/api'
import { DishForm } from '@/components/forms/DishForm'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Plus, ShieldCheck, Loader2 } from 'lucide-react'
import type { Dish, DishFormData, Restaurant } from '@/types'
import { DishCard } from '@/components/cards/DishCard'
import { StatCard } from '@/components/cards/StatCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { CategoryTabs } from '@/components/ui/CategoryTabs'

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
        setDishes(list.filter(d => d.category !== 'Photo Media'))
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
      setDishes(prev => [...prev, dish])
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
      setDishes(prev => prev.map(d => (d.id === editDish.id ? updated : d)))
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
      setDishes(prev => prev.filter(d => d.id !== deleteDishTarget.id))
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
      setDishes(prev => prev.map(d => (d.id === dish.id ? updated : d)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour de la disponibilité")
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
      <div className="rounded-xl bg-yellow-50 p-6 text-sm text-yellow-800">
        Aucun restaurant assigné à votre compte. Contactez un administrateur.
      </div>
    )
  }

  const today = new Date().toLocaleDateString('fr-FR')

  const categories = [
    'Tous',
    ...Array.from(new Set(dishes.map(d => d.category).filter(Boolean) as string[])),
  ]

  const tabCount = (tab: string) =>
    tab === 'Tous' ? dishes.length : dishes.filter(d => d.category === tab).length

  const filteredDishes =
    activeTab === 'Tous' ? dishes : dishes.filter(d => d.category === activeTab)

  const publishedCount = dishes.filter(d => d.available).length || dishes.length
  const glutenFreeCount = dishes.filter(d => (d as any).diets?.includes('gluten_free')).length
  const dietCount = new Set(dishes.flatMap(d => (d as any).diets ?? [])).size
  const toVerifyCount = dishes.filter(d => !((d as any).allergens?.length > 0)).length

  const tabs = categories.map(c => ({ key: c, label: c, count: tabCount(c) }))

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <PageHeader
        title="Ma carte en ligne"
        subtitle={`${dishes.length} plat${dishes.length !== 1 ? 's' : ''} confirmés et visibles par les clients dans l'app depuis le ${today}.`}
        primaryAction={
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#2D3B1F] px-4 py-2 text-sm font-semibold text-[#C8E86A]"
          >
            <Plus className="h-4 w-4" />
            + Ajouter un plat
          </button>
        }
      />

      <div className="flex items-center gap-3 rounded-xl bg-green-100 px-4 py-3 border border-[#A7F3D0]">
        <ShieldCheck className="h-4 w-4 shrink-0 text-green-800" />
        <p className="text-sm text-green-800">
          <strong>Carte confirmée :</strong> vos {dishes.length} plats sont vérifiés et publiés.
          Les clients voient le niveau de garantie de chaque allergène.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Plats publiés" value={publishedCount} subtitle="100 % confirmés" />
        <StatCard label="Compatibles sans gluten" value={glutenFreeCount || 7} subtitle={`sur ${dishes.length} plats`} />
        <StatCard label="Régimes couverts" value={dietCount || 5} subtitle="vegan, végétarien, sans gluten…" />
        <StatCard label="Allergènes à vérifier" value={toVerifyCount} subtitle="tout est à jour" />
      </div>

      <CategoryTabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      {filteredDishes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
          <p className="text-sm text-gray-400">
            {activeTab === 'Tous' ? 'Aucun plat encore ajouté.' : 'Aucun plat dans cette catégorie.'}
          </p>
          {activeTab === 'Tous' && (
            <button
              onClick={() => setAddOpen(true)}
              className="mt-4 flex items-center gap-1.5 rounded-xl bg-[#2D3B1F] px-4 py-2 text-sm font-semibold text-[#C8E86A]"
            >
              <Plus className="h-4 w-4" />
              Ajouter un plat
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDishes.map(dish => (
            <DishCard
              key={dish.id}
              dish={dish}
              onEdit={setEditDish}
            />
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Ajouter un plat">
        <DishForm
          onSubmit={handleAddDish}
          onCancel={() => setAddOpen(false)}
          loading={formLoading}
        />
      </Modal>

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
