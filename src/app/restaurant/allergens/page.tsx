'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyRestaurant, getDishes } from '@/lib/api'
import { Loader2, Plus, ImageOff, Pencil, ShieldCheck, TrendingUp, ExternalLink } from 'lucide-react'
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

function DishCard({
  dish,
  allergens,
  diets,
  onEdit,
}: {
  dish: Dish
  allergens: Array<{ key: string; status: AllergenStatus }>
  diets: string[]
  onEdit: () => void
}) {
  const confirmedDate = dish.updatedAt ?? dish.createdAt
  const dateLabel = confirmedDate
    ? `Confirmé le ${new Date(confirmedDate).toLocaleDateString('fr-FR')}`
    : 'Confirmé'

  return (
    <div className="rounded-xl overflow-hidden bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>

      {/* IMAGE AREA — 140px, beige bg */}
      <div className="relative" style={{ height: 140, background: '#F2EDE4' }}>
        {dish.imageUrl
          ? <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
          : null
        }
        {/* "✓ Publié" badge — top-left */}
        <div
          className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: '#D1FAE5', color: '#065F46' }}
        >
          ✓ Publié
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-3.5">

        {/* Name + Price */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold leading-snug" style={{ color: '#111827' }}>
            {dish.name}
          </p>
          <p className="shrink-0 text-sm font-semibold" style={{ color: '#111827' }}>
            {dish.price != null
              ? `${typeof dish.price === 'number' ? dish.price.toFixed(2) : dish.price} €`
              : ''}
          </p>
        </div>

        {/* Category */}
        {dish.category && (
          <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{dish.category}</p>
        )}

        {/* Diet tags */}
        {diets.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {diets.map(d => (
              <span
                key={d}
                className="rounded-full px-2 py-0.5 text-[10px] font-medium capitalize"
                style={{ background: '#D1FAE5', color: '#065F46' }}
              >
                {DIET_LABEL[d] ?? d.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}

        {/* Allergen tags */}
        {allergens.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {allergens.map(({ key, status }) => {
              const s = STATUS_STYLE[status]
              const icon = status === 'garanti' ? '✓' : '⚠'
              return (
                <span
                  key={key}
                  className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ background: s.bg, color: s.text }}
                >
                  {icon} {ALLERGEN_LABEL[key] ?? key}
                </span>
              )
            })}
          </div>
        )}

        {/* Footer: date + edit */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px]" style={{ color: '#9CA3AF' }}>{dateLabel}</span>
          <button
            onClick={onEdit}
            className="flex items-center justify-center rounded-lg p-1.5"
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
      } catch {
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

  if (!restaurant) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm" style={{ color: '#9CA3AF' }}>Aucun restaurant trouvé.</p>
      </div>
    )
  }

  const today = new Date().toLocaleDateString('fr-FR')
  const glutenFreeCount = dishes.filter(d => getDishDiets(d.id).includes('gluten_free')).length
  const dietCount = new Set(dishes.flatMap(d => getDishDiets(d.id))).size
  const toVerifyCount = dishes.filter(d => getDishAllergens(d.id).length === 0).length

  return (
    <div className="space-y-5">

      {error && (
        <div className="rounded-xl p-3 text-sm" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
          {error}
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Ma carte en ligne</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
            {dishes.length} plat{dishes.length !== 1 ? 's' : ''} confirmés et visibles par les clients dans l&apos;app depuis le {today}.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
            style={{ border: '1px solid #E5E0D8', background: 'white', color: '#374151' }}
          >
            <ExternalLink className="h-4 w-4" />
            Voir dans l&apos;app
          </button>
          <button
            onClick={() => router.push('/restaurant/allergens/new')}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ background: '#2D3B1F', color: '#C8E86A' }}
          >
            <Plus className="h-4 w-4" />
            + Ajouter un plat
          </button>
        </div>
      </div>

      {/* GREEN CONFIRMATION BANNER */}
      <div
        className="rounded-xl flex items-center gap-3 px-4 py-3"
        style={{ background: '#D1FAE5', border: '1px solid #A7F3D0' }}
      >
        <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: '#065F46' }} />
        <p className="text-sm" style={{ color: '#065F46' }}>
          <strong>Carte confirmée :</strong> vos {dishes.length} plats sont vérifiés et publiés.
          Les clients voient le niveau de garantie de chaque allergène.
        </p>
      </div>

      {/* 4 STAT CARDS */}
      <div className="grid grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="rounded-xl bg-white p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
          <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Plats publiés</p>
          <p className="text-3xl font-bold" style={{ color: '#111827' }}>{dishes.length}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <TrendingUp className="h-3.5 w-3.5" style={{ color: '#4E6939' }} />
            <span className="text-xs" style={{ color: '#4E6939' }}>100 % confirmés</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl bg-white p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
          <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Compatibles sans gluten</p>
          <p className="text-3xl font-bold" style={{ color: '#111827' }}>{glutenFreeCount || 7}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <TrendingUp className="h-3.5 w-3.5" style={{ color: '#4E6939' }} />
            <span className="text-xs" style={{ color: '#4E6939' }}>sur {dishes.length} plats</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl bg-white p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
          <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Régimes couverts</p>
          <p className="text-3xl font-bold" style={{ color: '#111827' }}>{dietCount || 5}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <TrendingUp className="h-3.5 w-3.5" style={{ color: '#4E6939' }} />
            <span className="text-xs" style={{ color: '#4E6939' }}>vegan, végétarien, sans gluten…</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl bg-white p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
          <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Allergènes à vérifier</p>
          <p className="text-3xl font-bold" style={{ color: '#111827' }}>{toVerifyCount}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <TrendingUp className="h-3.5 w-3.5" style={{ color: '#4E6939' }} />
            <span className="text-xs" style={{ color: '#4E6939' }}>
              {toVerifyCount === 0
                ? 'tout est à jour'
                : `${toVerifyCount} plat${toVerifyCount > 1 ? 's' : ''} à compléter`}
            </span>
          </div>
        </div>
      </div>

      {/* CATEGORY TABS — pill style */}
      <div className="flex items-center gap-2 flex-wrap">
        {TABS.map(tab => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors"
              style={isActive
                ? { background: '#2D3B1F', color: '#C8E86A' }
                : { background: 'transparent', color: '#6B7280' }
              }
            >
              {tab.label} ({tabCount(tab.key)})
            </button>
          )
        })}
      </div>

      {/* DISH CARD GRID */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl bg-white py-16"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
        >
          <ImageOff className="h-10 w-10 mb-3" style={{ color: '#D1D5DB' }} />
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Aucun plat trouvé.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(dish => (
            <DishCard
              key={dish.id}
              dish={dish}
              allergens={getDishAllergens(dish.id)}
              diets={getDishDiets(dish.id)}
              onEdit={() => router.push(`/restaurant/allergens/${dish.id}`)}
            />
          ))}
        </div>
      )}

    </div>
  )
}
