'use client'

import { useEffect, useState } from 'react'
import { getMyRestaurant, getDishes } from '@/lib/api'
import { Loader2, Plus, Upload, ImageOff, Share2, Eye } from 'lucide-react'
import type { Dish, Restaurant } from '@/types'

const ALLERGEN_EMOJI: Record<string, string> = {
  gluten: '🌾', lactose: '🥛', oeufs: '🥚', poisson: '🐟',
  arachides: '🥜', soja: '🫘', fruits_coque: '🌰', celeri: '🌿',
  moutarde: '🌻', sesame: '🌱', sulfites: '🍷', lupin: '🫛',
  crustaces: '🦐', mollusques: '🦪',
}

const ALLERGEN_COLORS: Record<string, { bg: string; text: string }> = {
  gluten:       { bg: '#FEF3C7', text: '#92400E' },
  lactose:      { bg: '#DBEAFE', text: '#1E40AF' },
  arachides:    { bg: '#FEE2E2', text: '#991B1B' },
  oeufs:        { bg: '#FEF9C3', text: '#854D0E' },
  poisson:      { bg: '#CFFAFE', text: '#155E75' },
  soja:         { bg: '#F3E8FF', text: '#6B21A8' },
  fruits_coque: { bg: '#FCE7F3', text: '#9D174D' },
  crustaces:    { bg: '#FED7AA', text: '#9A3412' },
  celeri:       { bg: '#D1FAE5', text: '#065F46' },
  moutarde:     { bg: '#FEF3C7', text: '#713F12' },
  sesame:       { bg: '#E0F2FE', text: '#075985' },
  sulfites:     { bg: '#EDE9FE', text: '#5B21B6' },
  lupin:        { bg: '#FCE7F3', text: '#831843' },
  mollusques:   { bg: '#ECFDF5', text: '#047857' },
}

const DIET_COLORS: Record<string, { bg: string; text: string }> = {
  vegan:        { bg: '#D1FAE5', text: '#065F46' },
  vegetarian:   { bg: '#DCFCE7', text: '#166534' },
  halal:        { bg: '#FEF3C7', text: '#92400E' },
  kosher:       { bg: '#DBEAFE', text: '#1E40AF' },
  gluten_free:  { bg: '#FEE2E2', text: '#991B1B' },
  lactose_free: { bg: '#F3E8FF', text: '#6B21A8' },
}

const ALL_ALLERGENS = [
  'gluten', 'crustaces', 'oeufs', 'poisson', 'arachides',
  'soja', 'lactose', 'fruits_coque', 'celeri', 'moutarde',
  'sesame', 'sulfites', 'lupin', 'mollusques',
]

const ALL_DIETS = [
  { key: 'vegan', label: 'Vegan' },
  { key: 'vegetarian', label: 'Végétarien' },
  { key: 'gluten_free', label: 'Sans gluten' },
  { key: 'lactose_free', label: 'Sans lactose' },
  { key: 'halal', label: 'Halal' },
  { key: 'kosher', label: 'Kosher' },
]

type TabKey = 'ALL' | 'Entrées' | 'Plats' | 'Desserts' | 'Boissons' | 'VERIFY'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ALL', label: 'Tous' },
  { key: 'Entrées', label: 'Entrées' },
  { key: 'Plats', label: 'Plats' },
  { key: 'Desserts', label: 'Desserts' },
  { key: 'Boissons', label: 'Boissons' },
  { key: 'VERIFY', label: 'À vérifier' },
]

export default function FichePage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('ALL')
  const [search, setSearch] = useState('')

  const [localAllergens, setLocalAllergens] = useState<Record<string, string[]>>({})
  const [localDiets, setLocalDiets] = useState<Record<string, string[]>>({})
  const [openPicker, setOpenPicker] = useState<{ id: string; type: 'allergens' | 'diets' } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const mine = await getMyRestaurant()
        setRestaurant(mine)
        if (mine) {
          const list = await getDishes(mine.id)
          setDishes(list)
          const allergenMap: Record<string, string[]> = {}
          const dietMap: Record<string, string[]> = {}
          list.forEach(d => {
            allergenMap[d.id] = (d as any).allergens ?? []
            dietMap[d.id] = (d as any).diets ?? []
          })
          setLocalAllergens(allergenMap)
          setLocalDiets(dietMap)
        }
      } catch {
        setError('Impossible de charger la fiche publique. Veuillez réessayer.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!openPicker) return
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('[data-picker]')) setOpenPicker(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openPicker])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#4E6939' }} />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div
        className="rounded-xl px-4 py-3 text-sm"
        style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' }}
      >
        Aucun restaurant trouvé pour votre compte.
      </div>
    )
  }

  function getDishAllergens(dishId: string): string[] {
    return localAllergens[dishId] ?? []
  }
  function getDishDiets(dishId: string): string[] {
    return localDiets[dishId] ?? []
  }
  function toggleAllergen(dishId: string, allergen: string) {
    setLocalAllergens(prev => {
      const current = prev[dishId] ?? []
      const next = current.includes(allergen)
        ? current.filter(a => a !== allergen)
        : [...current, allergen]
      return { ...prev, [dishId]: next }
    })
  }
  function toggleDiet(dishId: string, diet: string) {
    setLocalDiets(prev => {
      const current = prev[dishId] ?? []
      const next = current.includes(diet)
        ? current.filter(d => d !== diet)
        : [...current, diet]
      return { ...prev, [dishId]: next }
    })
  }

  const tabCount = (key: TabKey) => {
    if (key === 'ALL') return dishes.length
    if (key === 'VERIFY') return dishes.filter(d => !getDishAllergens(d.id).length).length
    return dishes.filter(d => (d.category ?? '') === key).length
  }

  const filtered = dishes.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.category ?? '').toLowerCase().includes(search.toLowerCase())
    const matchTab =
      activeTab === 'ALL' ? true :
      activeTab === 'VERIFY' ? !getDishAllergens(d.id).length :
      (d.category ?? '') === activeTab
    return matchSearch && matchTab
  })

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
          {error}
        </div>
      )}

      {/* Page header card */}
      <div className="rounded-xl bg-white p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <div className="flex items-start justify-between">
          <div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium mb-3"
              style={{ background: 'rgba(200,232,106,0.2)', color: '#2D3B1F' }}
            >
              <Eye className="h-3 w-3" /> Aperçu public
            </span>
            <h2 className="text-xl font-bold" style={{ color: '#111827' }}>
              {restaurant.name ?? '—'}
            </h2>
            <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
              {(restaurant as any).cuisine && `${(restaurant as any).cuisine} · `}{restaurant.address}
            </p>
            {restaurant.description && (
              <p className="mt-2 text-sm max-w-lg" style={{ color: '#9CA3AF' }}>
                {restaurant.description}
              </p>
            )}
          </div>
          <button
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ background: '#2D3B1F', color: '#C8E86A' }}
          >
            <Share2 className="h-4 w-4" />
            Partager la fiche
          </button>
        </div>
      </div>

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
            const count = tabCount(tab.key)
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
                  {count}
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
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-opacity"
          style={{ background: '#2D3B1F', color: '#C8E86A' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Plus className="h-4 w-4" />
          Ajouter un plat
        </button>
      </div>

      {/* Table card */}
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
                <th className="px-5 py-3 text-left text-xs font-medium tracking-wide" style={{ color: '#6B7280' }}>PLAT</th>
                <th className="px-5 py-3 text-left text-xs font-medium tracking-wide" style={{ color: '#6B7280' }}>CATÉGORIE</th>
                <th className="px-5 py-3 text-left text-xs font-medium tracking-wide" style={{ color: '#6B7280' }}>RÉGIMES</th>
                <th className="px-5 py-3 text-left text-xs font-medium tracking-wide" style={{ color: '#6B7280' }}>ALLERGÈNES DÉCLARÉS</th>
                <th className="px-5 py-3 text-left text-xs font-medium tracking-wide" style={{ color: '#6B7280' }}>STATUT</th>
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
                          <img
                            src={dish.imageUrl}
                            alt={dish.name}
                            className="h-10 w-10 rounded-lg object-cover shrink-0"
                          />
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
                      <div className="relative" data-picker>
                        <div className="flex flex-wrap items-center gap-1">
                          {diets.map((diet) => {
                            const s = DIET_COLORS[diet.toLowerCase()] ?? { bg: '#F3F4F6', text: '#374151' }
                            return (
                              <button
                                key={diet}
                                onClick={() => toggleDiet(dish.id, diet)}
                                className="rounded-full px-2 py-0.5 text-[10px] font-medium capitalize transition-opacity"
                                style={{ background: s.bg, color: s.text }}
                                title="Cliquer pour retirer"
                              >
                                {diet.replace(/_/g, ' ')} ×
                              </button>
                            )
                          })}
                          <button
                            onClick={() => setOpenPicker(
                              openPicker?.id === dish.id && openPicker.type === 'diets'
                                ? null
                                : { id: dish.id, type: 'diets' }
                            )}
                            className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors"
                            style={{ background: '#F2EDE4', color: '#9CA3AF' }}
                            title="Ajouter un régime"
                          >
                            +
                          </button>
                        </div>

                        {openPicker?.id === dish.id && openPicker.type === 'diets' && (
                          <div
                            className="absolute left-0 top-full z-50 mt-1 rounded-xl bg-white p-3 shadow-lg"
                            style={{ minWidth: 200, border: '1px solid #E5E0D8' }}
                          >
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>
                              Régimes compatibles
                            </p>
                            <div className="space-y-1">
                              {ALL_DIETS.map(({ key, label }) => {
                                const selected = diets.includes(key)
                                const s = DIET_COLORS[key] ?? { bg: '#F3F4F6', text: '#374151' }
                                return (
                                  <button
                                    key={key}
                                    onClick={() => toggleDiet(dish.id, key)}
                                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors text-left"
                                    style={{ background: selected ? s.bg : 'transparent' }}
                                  >
                                    <span
                                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px]"
                                      style={{
                                        background: selected ? s.bg : 'white',
                                        border: `1px solid ${selected ? s.text : '#D1D5DB'}`,
                                        color: s.text,
                                      }}
                                    >
                                      {selected ? '✓' : ''}
                                    </span>
                                    <span style={{ color: selected ? s.text : '#374151' }}>{label}</span>
                                  </button>
                                )
                              })}
                            </div>
                            <button
                              onClick={() => setOpenPicker(null)}
                              className="mt-2 w-full rounded-lg py-1.5 text-xs font-medium"
                              style={{ background: '#2D3B1F', color: '#C8E86A' }}
                            >
                              Confirmer
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* ALLERGÈNES DÉCLARÉS */}
                    <td className="px-5 py-3">
                      <div className="relative" data-picker>
                        <div className="flex flex-wrap items-center gap-1">
                          {allergens.map((a) => {
                            const key = a.toLowerCase()
                            const s = ALLERGEN_COLORS[key] ?? { bg: '#F3F4F6', text: '#374151' }
                            const emoji = ALLERGEN_EMOJI[key] ?? ''
                            return (
                              <button
                                key={a}
                                onClick={() => toggleAllergen(dish.id, a)}
                                className="rounded-full px-2 py-0.5 text-[10px] font-medium capitalize transition-opacity"
                                style={{ background: s.bg, color: s.text }}
                                title="Cliquer pour retirer"
                              >
                                {emoji} {a.replace(/_/g, ' ')} ×
                              </button>
                            )
                          })}
                          <button
                            onClick={() => setOpenPicker(
                              openPicker?.id === dish.id && openPicker.type === 'allergens'
                                ? null
                                : { id: dish.id, type: 'allergens' }
                            )}
                            className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors"
                            style={{ background: '#F2EDE4', color: '#9CA3AF' }}
                            title="Ajouter un allergène"
                          >
                            +
                          </button>
                        </div>

                        {openPicker?.id === dish.id && openPicker.type === 'allergens' && (
                          <div
                            className="absolute left-0 top-full z-50 mt-1 rounded-xl bg-white p-3 shadow-lg"
                            style={{ minWidth: 240, border: '1px solid #E5E0D8' }}
                          >
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>
                              14 allergènes réglementaires
                            </p>
                            <div className="grid grid-cols-2 gap-1">
                              {ALL_ALLERGENS.map((a) => {
                                const selected = allergens.includes(a)
                                const s = ALLERGEN_COLORS[a] ?? { bg: '#F3F4F6', text: '#374151' }
                                const emoji = ALLERGEN_EMOJI[a] ?? ''
                                return (
                                  <button
                                    key={a}
                                    onClick={() => toggleAllergen(dish.id, a)}
                                    className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] transition-colors text-left"
                                    style={{ background: selected ? s.bg : 'transparent' }}
                                  >
                                    <span
                                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px]"
                                      style={{
                                        background: selected ? s.bg : 'white',
                                        border: `1px solid ${selected ? s.text : '#D1D5DB'}`,
                                        color: s.text,
                                      }}
                                    >
                                      {selected ? '✓' : ''}
                                    </span>
                                    <span style={{ color: selected ? s.text : '#374151' }}>
                                      {emoji} <span className="capitalize">{a.replace(/_/g, ' ')}</span>
                                    </span>
                                  </button>
                                )
                              })}
                            </div>
                            <button
                              onClick={() => setOpenPicker(null)}
                              className="mt-2 w-full rounded-lg py-1.5 text-xs font-medium"
                              style={{ background: '#2D3B1F', color: '#C8E86A' }}
                            >
                              Confirmer
                            </button>
                          </div>
                        )}
                      </div>
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
