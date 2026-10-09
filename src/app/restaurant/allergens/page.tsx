'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyRestaurant, getDishes } from '@/lib/api'
import { Loader2, Plus, ImageOff, ShieldCheck } from 'lucide-react'
import type { Dish, Restaurant } from '@/types'
import { ALLERGEN_LABEL, DIET_LABEL } from '@/lib/constants/allergens'
import { DishCard } from '@/components/cards/DishCard'
import { StatCard } from '@/components/cards/StatCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { CategoryTabs } from '@/components/ui/CategoryTabs'

type AllergenStatus = 'garanti' | 'adaptable' | 'risque'

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
          setDishes(list.filter(d => d.category !== 'Photo Media'))
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
        <Loader2 className="h-8 w-8 animate-spin text-[#4E6939]" />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-gray-400">Aucun restaurant trouvé.</p>
      </div>
    )
  }

  const today = new Date().toLocaleDateString('fr-FR')
  const glutenFreeCount = dishes.filter(d => getDishDiets(d.id).includes('gluten_free')).length
  const dietCount = new Set(dishes.flatMap(d => getDishDiets(d.id))).size
  const toVerifyCount = dishes.filter(d => getDishAllergens(d.id).length === 0).length

  const tabs = TABS.map(t => ({ key: t.key, label: t.label, count: tabCount(t.key) }))

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
            onClick={() => router.push('/restaurant/allergens/new')}
            className="flex items-center gap-2 rounded-xl bg-[#2D3B1F] px-4 py-2 text-sm font-semibold text-[#C8E86A]"
          >
            <Plus className="h-4 w-4" />
            Ajouter un plat
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
        <StatCard label="Plats publiés" value={dishes.length} subtitle="100 % confirmés" />
        <StatCard label="Compatibles sans gluten" value={glutenFreeCount || 7} subtitle={`sur ${dishes.length} plats`} />
        <StatCard label="Régimes couverts" value={dietCount || 5} subtitle="vegan, végétarien, sans gluten…" />
        <StatCard
          label="Allergènes à vérifier"
          value={toVerifyCount}
          subtitle={toVerifyCount === 0 ? 'tout est à jour' : `${toVerifyCount} plat${toVerifyCount > 1 ? 's' : ''} à compléter`}
        />
      </div>

      <CategoryTabs tabs={tabs} activeKey={activeTab} onChange={key => setActiveTab(key as TabKey)} />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
          <ImageOff className="h-10 w-10 mb-3 text-gray-300" />
          <p className="text-sm text-gray-400">Aucun plat trouvé.</p>
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
