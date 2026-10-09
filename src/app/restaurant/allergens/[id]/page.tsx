'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getMyRestaurant, getDishes, createDish, updateDish } from '@/lib/api'
import { Loader2, Save, ImagePlus, X } from 'lucide-react'
import Link from 'next/link'
import type { Restaurant, Dish } from '@/types'

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
  sulfites: 'Sulfites', lupin: 'Lupin', crustaces: 'Crustacés',
  mollusques: 'Mollusques',
}

const ALL_ALLERGENS = [
  'gluten', 'crustaces', 'oeufs', 'poisson', 'arachides',
  'soja', 'lactose', 'fruits_coque', 'celeri', 'moutarde',
  'sesame', 'sulfites', 'lupin', 'mollusques',
]

const ALL_DIETS = [
  { key: 'vegetarian', label: 'Végétarien' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'gluten_free', label: 'Sans gluten' },
  { key: 'lactose_free', label: 'Sans lactose' },
  { key: 'halal', label: 'Halal', note: 'Certification requise' },
  { key: 'kosher', label: 'Kosher', note: 'Certification requise' },
]

const STATUS_STYLE: Record<AllergenStatus, { bg: string; text: string; label: string; border: string }> = {
  garanti:   { bg: '#D1FAE5', text: '#065F46', label: 'Garanti', border: '#6EE7B7' },
  adaptable: { bg: '#FEF3C7', text: '#92400E', label: 'Adaptable', border: '#FCD34D' },
  risque:    { bg: '#FEE2E2', text: '#991B1B', label: 'Risque', border: '#FCA5A5' },
}

const CATEGORIES = ['Entrées', 'Plats', 'Desserts', 'Boissons']

function compressImage(file: File): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      const max = 800
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/jpeg', 0.72))
    }
    img.src = objectUrl
  })
}

const LS_KEY = 'yumnut_dish_allergens'

type LocalData = Record<string, { allergens: Record<string, AllergenStatus>; diets: string[] }>

function readLocalData(): LocalData {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '{}') } catch { return {} }
}
function writeLocalData(data: LocalData) {
  localStorage.setItem(LS_KEY, JSON.stringify(data))
}

export default function DishEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const isNew = id === 'new'

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [dish, setDish] = useState<Dish | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [category, setCategory] = useState('Plats')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [available, setAvailable] = useState(true)
  const [imageUrl, setImageUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedDiets, setSelectedDiets] = useState<string[]>([])
  const [allergenStatus, setAllergenStatus] = useState<Record<string, AllergenStatus | null>>({})

  useEffect(() => {
    async function load() {
      try {
        const mine = await getMyRestaurant()
        setRestaurant(mine)
        if (!isNew) {
          const list = await getDishes(mine.id)
          const found = list.find(d => d.id === id)
          if (found) {
            setDish(found)
            setName(found.name)
            setCategory(found.category ?? 'Plats')
            setPrice(String(found.price ?? ''))
            setDescription(found.description ?? '')
            setAvailable(found.available)
            setImageUrl(found.imageUrl ?? '')
          }
          const local = readLocalData()
          if (local[id]) {
            setSelectedDiets(local[id].diets ?? [])
            const status: Record<string, AllergenStatus | null> = {}
            Object.entries(local[id].allergens ?? {}).forEach(([k, v]) => { status[k] = v })
            setAllergenStatus(status)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isNew])

  async function handleSave() {
    if (!restaurant || !name.trim()) return
    setSaving(true)
    setError('')
    try {
      let dishId = id
      const formData = {
        name: name.trim(),
        category,
        price: Math.max(parseFloat(price) || 0.01, 0.01),
        description: description.trim(),
        available,
        imageUrl: imageUrl || undefined,
      }
      if (isNew) {
        const created = await createDish(restaurant.id, formData)
        dishId = created.id
      } else {
        await updateDish(restaurant.id, id, formData)
      }
      const local = readLocalData()
      local[dishId] = {
        allergens: Object.fromEntries(
          Object.entries(allergenStatus).filter(([, v]) => v != null)
        ) as Record<string, AllergenStatus>,
        diets: selectedDiets,
      }
      writeLocalData(local)
      router.push('/restaurant/allergens')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  function toggleDiet(key: string) {
    setSelectedDiets(prev => prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key])
  }

  function setStatus(allergen: string, status: AllergenStatus) {
    setAllergenStatus(prev => ({ ...prev, [allergen]: prev[allergen] === status ? null : status }))
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#4E6939' }} />
      </div>
    )
  }

  const declaredAllergens = ALL_ALLERGENS.filter(a => allergenStatus[a])
  const hasRisk = declaredAllergens.some(a => allergenStatus[a] === 'risque')

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs">
            <Link href="/restaurant/allergens" style={{ color: '#4E6939' }} className="hover:underline">
              Carte & allergènes
            </Link>
            <span style={{ color: '#D1D5DB' }}>›</span>
            <span style={{ color: '#111827' }}>{isNew ? 'Nouveau plat' : (name || 'Modifier le plat')}</span>
          </div>
          {!isNew && dish?.updatedAt && (
            <p className="mt-0.5 text-[11px]" style={{ color: '#9CA3AF' }}>
              Dernière mise à jour le {new Date(dish.updatedAt).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/restaurant/allergens')}
            className="rounded-xl border px-4 py-2 text-sm font-medium"
            style={{ border: '1px solid #E5E0D8', background: 'white', color: '#6B7280' }}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
            style={{ background: '#2D3B1F', color: '#C8E86A' }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Enregistrer et publier
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
          {error}
        </div>
      )}

      {!isNew && (
        <div className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
          style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <span style={{ color: '#D97706' }}>⚠</span>
          <p style={{ color: '#92400E' }}>
            1 client a signalé du gluten à pain <span className="font-semibold">(EN COURS)</span>. Vérifiez le réseau › Résumé › 0 réponses avant de publier.
          </p>
        </div>
      )}

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left: dish info */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <p className="mb-5 text-sm font-semibold" style={{ color: '#111827' }}>Informations du plat</p>
            <div className="flex gap-5">
              {/* Image */}
              <div className="relative h-28 w-28 shrink-0">
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="Aperçu" className="h-28 w-28 rounded-xl object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageUrl(''); if (fileInputRef.current) fileInputRef.current.value = '' }}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                      aria-label="Supprimer la photo"
                    >
                      <X style={{ width: 10, height: 10 }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-1.5 right-1.5 rounded-md bg-black/50 px-1.5 py-0.5 text-[9px] font-medium text-white"
                    >
                      Changer
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-28 w-28 flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors hover:border-[#4E6939] hover:text-[#4E6939]"
                    style={{ borderColor: '#E5E0D8', background: '#F9F7F4', color: '#9CA3AF' }}
                  >
                    <ImagePlus className="h-6 w-6 mb-1" />
                    <span className="text-[10px] text-center px-2">Ajouter une photo</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (file) setImageUrl(await compressImage(file))
                  }}
                />
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: '#6B7280' }}>Nom du plat</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex : Burger Avocat"
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ border: '1px solid #E5E0D8', color: '#111827' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#4E6939')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#E5E0D8')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium" style={{ color: '#6B7280' }}>Catégorie</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                      style={{ border: '1px solid #E5E0D8', color: '#111827' }}
                    >
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium" style={{ color: '#6B7280' }}>Prix</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-lg px-3 py-2 pr-8 text-sm outline-none"
                        style={{ border: '1px solid #E5E0D8', color: '#111827' }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#4E6939')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#E5E0D8')}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#9CA3AF' }}>€</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: '#6B7280' }}>Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Ingrédients, préparation…"
                    rows={3}
                    className="w-full resize-none rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ border: '1px solid #E5E0D8', color: '#111827' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#4E6939')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#E5E0D8')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: régimes + preview */}
        <div className="space-y-4">
          <div className="rounded-xl bg-white p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <p className="mb-3 text-sm font-semibold" style={{ color: '#111827' }}>Régimes compatibles</p>
            <div className="space-y-1">
              {ALL_DIETS.map(({ key, label, note }) => {
                const checked = selectedDiets.includes(key)
                return (
                  <button
                    key={key}
                    onClick={() => toggleDiet(key)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors"
                    style={{ background: checked ? 'rgba(200,232,106,0.12)' : 'transparent' }}
                  >
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold"
                      style={{
                        background: checked ? '#4E6939' : 'white',
                        border: `1.5px solid ${checked ? '#4E6939' : '#D1D5DB'}`,
                        color: 'white',
                      }}
                    >
                      {checked ? '✓' : ''}
                    </span>
                    <div>
                      <p className="text-sm" style={{ color: '#111827' }}>{label}</p>
                      {note && <p className="text-[10px]" style={{ color: '#9CA3AF' }}>{note}</p>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl bg-white p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <p className="mb-3 text-sm font-semibold" style={{ color: '#111827' }}>Aperçu dans l'app</p>
            <div className="rounded-xl p-4" style={{ background: '#F9F8F5' }}>
              <p className="text-xs font-semibold mb-0.5" style={{ color: '#111827' }}>
                {name || <span style={{ color: '#D1D5DB' }}>Nom du plat</span>}
              </p>
              {price && (
                <p className="text-xs mb-2" style={{ color: '#4E6939' }}>
                  {parseFloat(price).toFixed(2)} €
                </p>
              )}
              {selectedDiets.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedDiets.map(d => {
                    const diet = ALL_DIETS.find(x => x.key === d)
                    return (
                      <span key={d} className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: 'rgba(200,232,106,0.25)', color: '#2D3B1F' }}>
                        {diet?.label}
                      </span>
                    )
                  })}
                </div>
              )}
              {declaredAllergens.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {declaredAllergens.slice(0, 5).map(a => {
                    const s = STATUS_STYLE[allergenStatus[a]!]
                    return (
                      <span key={a} className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: s.bg, color: s.text }}>
                        {ALLERGEN_EMOJI[a]} {ALLERGEN_LABEL[a]}
                      </span>
                    )
                  })}
                  {declaredAllergens.length > 5 && (
                    <span className="text-[10px]" style={{ color: '#9CA3AF' }}>+{declaredAllergens.length - 5}</span>
                  )}
                </div>
              ) : (
                <p className="text-[11px]" style={{ color: '#D1D5DB' }}>Aucune information renseignée.</p>
              )}
            </div>
            {hasRisk && (
              <div className="mt-3 rounded-lg px-3 py-2 text-[11px]"
                style={{ background: '#FEF2F2', color: '#B91C1C' }}>
                ⚠ Allergie déclarée : les clients ne verront pas ce plat si l'allergie est filtrée.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Allergènes réglementaires */}
      <div className="rounded-xl bg-white overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #F2EDE4' }}>
          <p className="text-sm font-semibold" style={{ color: '#111827' }}>Allergènes réglementaires (14)</p>
          <p className="mt-0.5 text-xs" style={{ color: '#9CA3AF' }}>
            Indiquez le niveau de présence de chaque allergène dans ce plat.
          </p>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #F2EDE4' }}>
              <th className="px-6 py-2.5 text-left text-xs font-medium" style={{ color: '#6B7280' }}>Allergène</th>
              <th className="px-6 py-2.5 text-center text-xs font-semibold" style={{ color: '#065F46' }}>Garanti absent</th>
              <th className="px-6 py-2.5 text-center text-xs font-semibold" style={{ color: '#92400E' }}>Adaptable</th>
              <th className="px-6 py-2.5 text-center text-xs font-semibold" style={{ color: '#991B1B' }}>Risque</th>
            </tr>
          </thead>
          <tbody>
            {ALL_ALLERGENS.map((a, i) => {
              const current = allergenStatus[a] ?? null
              return (
                <tr key={a} style={{ borderBottom: i < ALL_ALLERGENS.length - 1 ? '1px solid #F9F7F4' : 'none' }}>
                  <td className="px-6 py-3">
                    <span className="flex items-center gap-2.5 text-sm font-medium" style={{ color: '#111827' }}>
                      <span className="text-lg leading-none">{ALLERGEN_EMOJI[a]}</span>
                      {ALLERGEN_LABEL[a]}
                    </span>
                  </td>
                  {(['garanti', 'adaptable', 'risque'] as AllergenStatus[]).map(status => {
                    const s = STATUS_STYLE[status]
                    const isActive = current === status
                    return (
                      <td key={status} className="px-6 py-3 text-center">
                        <button
                          onClick={() => setStatus(a, status)}
                          className="inline-flex items-center justify-center rounded-full px-4 py-1 text-xs font-semibold transition-all"
                          style={isActive
                            ? { background: s.bg, color: s.text, border: `1.5px solid ${s.border}` }
                            : { background: '#F3F4F6', color: '#9CA3AF', border: '1.5px solid transparent' }
                          }
                        >
                          {s.label}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
