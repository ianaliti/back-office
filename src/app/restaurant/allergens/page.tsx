'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyRestaurant, getDishes } from '@/lib/api'
import { Loader2, Plus, Upload, ImageOff, Pencil } from 'lucide-react'
import type { Dish, Restaurant } from '@/types'

type AllergenStatus = 'garanti' | 'adaptable' | 'risque'

const ALLERGEN_EMOJI: Record<string, string> = {
  gluten: '🌾', lactose: '🥛', oeufs: '🥚', poisson: '🐟',
  arachides: '🥜', soja: '🫘', fruits_coque: '🌰', celeri: '🌿',
  moutarde: '🌻', sesame: '🌱', sulfites: '🍷', lupin: '🫛',
  crustaces: '🦐', mollusques: '🦪',
}

const ALLERGEN_LABEL: Record<string, string> = {
  gluten: 'Gluten', lactose: 'Lait', oeufs: 'Œufs', poisson: 'Poissons',
  arachides: 'Arachides', soja: 'Soja', fruits_coque: 'Fruits à coque',
  celeri: 'Céleri', moutarde: 'Moutarde', sesame: 'Sésame',
  sulfites: 'Sulfites', lupin: 'Lupin', crustaces: 'Crustacés', mollusques: 'Mollusques',
}

const STATUS_STYLE: Record<AllergenStatus, { bg: string; text: string }> = {
  garanti:   { bg: '#D1FAE5', text: '#065F46' },
  adaptable: { bg: '#FEF3C7', text: '#92400E' },
  risque:    { bg: '#FEE2E2', text: '#991B1B' },
}

const DIET_COLORS: Record<string, { bg: string; text: string }> = {
  vegan:        { bg: '#D1FAE5', text: '#065F46' },
  vegetarian:   { bg: '#DCFCE7', text: '#166534' },
  halal:        { bg: '#FEF3C7', text: '#92400E' },
  kosher:       { bg: '#DBEAFE', text: '#1E40AF' },
  gluten_free:  { bg: '#FEE2E2', text: '#991B1B' },
  lactose_free: { bg: '#F3E8FF', text: '#6B21A8' },
}

const DIET_LABEL: Record<string, string> = {
  vegan: 'Vegan', vegetarian: 'Végétarien', gluten_free: 'Sans gluten',
  lactose_free: 'Sans lactose', halal: 'Halal', kosher: 'Kosher',
}

type TabKey = 'ALL' | 'Entrées' | 'Plats' | 'Desserts' | 'Boissons' | 'VERIFY'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ALL', label: 'Tous' },
  { key: 'Entrées', label: 'Entrées' },
  { key: 'Plats', label: 'Plats' },
  { key: 'Desserts', label: 'Desserts' },
  { key: 'Boissons', label: 'Boissons' },
  { key: 'VERIFY', label: 'À vérifier' },
]

const LS_KEY = 'yumnut_dish_allergens'

type LocalData = Record<string, { allergens: Record<string, AllergenStatus>; diets: string[] }>

function readLocalData(): LocalData {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '{}') } catch { return {} }
}

export default function AllergensPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('ALL')
  const [dishData, setDishData] = useState<LocalData>({})

  useEffect(() => {
    async function load() {
      try {
        const mine = await getMyRestaurant()
        setRestaurant(mine)
        if (mine) {
          const list = await getDishes(mine.id)
          setDishes(list)
          setDishData(readLocalData())
        }
      } catch (err) {
        setError('Impossible de charger la carte. Veuillez réessayer.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function getDishAllergens(dishId: string): Array<{ key: string; status: AllergenStatus }> {
    const allergens = dishData[dishId]?.allergens ?? {}
    return Object.entries(allergens).map(([key, status]) => ({ key, status }))
  }

  function getDishDiets(dishId: string): string[] {
    return dishData[dishId]?.diets ?? []
  }

  const tabCount = (key: TabKey) => {
    if (key === 'ALL') return dishes.length
    if (key === 'VERIFY') return dishes.filter(d => getDishAllergens(d.id).length === 0).length
    return dishes.filter(d => (d.category ?? '') === key).length
  }

  const filtered = dishes.filter(d => {
    if (activeTab === 'ALL') return true
    if (activeTab === 'VERIFY') return getDishAllergens(d.id).length === 0
    return (d.category ?? '') === activeTab
  })

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#4E6939' }} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Restaurant info card */}
      {restaurant && (
        <div
          className="rounded-xl bg-white px-5 py-4 flex items-center justify-between"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
              style={{ background: '#2D3B1F', color: '#C8E86A' }}
            >
              {restaurant.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#111827' }}>{restaurant.name}</p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                {[(restaurant as any).cuisine, restaurant.address].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {(restaurant as any).phone && (
              <p className="text-xs" style={{ color: '#6B7280' }}>{(restaurant as any).phone}</p>
            )}
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: 'rgba(200,232,106,0.2)', color: '#2D3B1F' }}
            >
              {dishes.length} plat{dishes.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Carte & allergènes</h1>
        <p className="mt-0.5 text-sm" style={{ color: '#9CA3AF' }}>
          Identifiez pour chaque plat la garantie des 14 allergènes réglementaires.
        </p>
      </div>

      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
          {error}
        </div>
      )}

      {/* Alert banner */}
      <div className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
        style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
        <span style={{ color: '#D97706' }}>⚠</span>
        <p style={{ color: '#92400E' }}>
          <span className="font-semibold">1 avis actif :</span>{' '}
          <span className="font-medium">Burger Avocat</span> — un client a signalé un allergène non déclaré sur ce plat.{' '}
          <span className="font-semibold" style={{ color: '#D97706' }}>(EN COURS)</span>
        </p>
      </div>

      {/* Top bar */}
      <div className="flex items-center gap-3">
        <div
          className="flex shrink-0 items-center gap-0.5 rounded-xl bg-white p-1"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
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
                  style={{
                    background: isActive ? 'rgba(200,232,106,0.2)' : '#F3F4F6',
                    color: isActive ? '#C8E86A' : '#9CA3AF',
                  }}
                >
                  {tabCount(tab.key)}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex-1" />

        <button
          className="flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-opacity"
          style={{ border: '1px solid #E5E0D8', background: 'white', color: '#4E6939' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Upload className="h-4 w-4" />
          Importer la carte
        </button>
        <button
          onClick={() => router.push('/restaurant/allergens/new')}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-opacity"
          style={{ background: '#2D3B1F', color: '#C8E86A' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Plus className="h-4 w-4" />
          Ajouter un plat
        </button>
      </div>

      {/* Table */}
      <div
        className="rounded-xl bg-white overflow-hidden"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
      >
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm" style={{ color: '#9CA3AF' }}>
            Aucun plat trouvé.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #F2EDE4' }}>
                {['PLAT', 'CATÉGORIE', 'RÉGIMES', 'ALLERGÈNES DÉCLARÉS', 'STATUT', ''].map(h => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-medium tracking-wide"
                    style={{ color: '#6B7280' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((dish, i) => {
                const allergens = getDishAllergens(dish.id)
                const diets = getDishDiets(dish.id)
                const hasAllergens = allergens.length > 0

                return (
                  <tr
                    key={dish.id}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F9F7F4' : 'none' }}
                  >
                    {/* PLAT */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {dish.imageUrl ? (
                          <img src={dish.imageUrl} alt={dish.name}
                            className="h-10 w-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                            style={{ background: '#F2EDE4' }}
                          >
                            <ImageOff className="h-4 w-4" style={{ color: '#9CA3AF' }} />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#111827' }}>{dish.name}</p>
                          {dish.price != null && (
                            <p className="text-xs" style={{ color: '#9CA3AF' }}>
                              {typeof dish.price === 'number'
                                ? `${dish.price.toFixed(2)} €`
                                : `${dish.price} €`}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* CATÉGORIE */}
                    <td className="px-5 py-3">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{ background: 'rgba(200,232,106,0.2)', color: '#2D3B1F' }}
                      >
                        {dish.category ?? '—'}
                      </span>
                    </td>

                    {/* RÉGIMES */}
                    <td className="px-5 py-3">
                      {diets.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {diets.map(d => {
                            const s = DIET_COLORS[d] ?? { bg: '#F3F4F6', text: '#374151' }
                            return (
                              <span key={d} className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                                style={{ background: s.bg, color: s.text }}>
                                {DIET_LABEL[d] ?? d}
                              </span>
                            )
                          })}
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: '#D1D5DB' }}>—</span>
                      )}
                    </td>

                    {/* ALLERGÈNES DÉCLARÉS */}
                    <td className="px-5 py-3">
                      {allergens.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {allergens.map(({ key, status }) => {
                            const s = STATUS_STYLE[status]
                            return (
                              <span key={key} className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                                style={{ background: s.bg, color: s.text }}>
                                {ALLERGEN_EMOJI[key]} {ALLERGEN_LABEL[key]}
                              </span>
                            )
                          })}
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: '#D1D5DB' }}>—</span>
                      )}
                    </td>

                    {/* STATUT */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      {hasAllergens ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                          style={{ background: '#D1FAE5', color: '#065F46' }}>
                          ✓ Exact
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                          style={{ background: '#FEF3C7', color: '#92400E' }}>
                          ⚠ À vérifier
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-3">
                      <button
                        onClick={() => router.push(`/restaurant/allergens/${dish.id}`)}
                        className="flex items-center justify-center rounded-lg p-1.5 transition-colors"
                        style={{ color: '#9CA3AF' }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#F2EDE4'
                          e.currentTarget.style.color = '#4E6939'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = '#9CA3AF'
                        }}
                        title="Modifier le plat"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
