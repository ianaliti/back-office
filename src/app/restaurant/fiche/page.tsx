'use client'

import { useEffect, useRef, useState } from 'react'
import { getMyRestaurant, updateRestaurant, getDishes, createDish, deleteDish } from '@/lib/api'
import {
  Loader2, ExternalLink, Star, MapPin, Phone, Clock, X, Plus,
} from 'lucide-react'
import type { Dish, Restaurant } from '@/types'

function compressImage(file: File): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      const max = 700
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.src = objectUrl
  })
}

const DAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
]

const ACCESSIBILITY_OPTIONS = [
  { key: 'pmr', label: 'Accès PMR' },
  { key: 'toilettes', label: 'Toilettes adaptées' },
  { key: 'cafe', label: 'Café' },
  { key: 'braille', label: 'Menu en braille' },
  { key: 'chaise_haute', label: 'Chaise haute' },
]

const PRICE_RANGES = ['< 12 €', '12 à 20 €', '20 à 35 €', '> 35 €']

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${checked ? 'bg-[#4E6939]' : 'bg-gray-300'}`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="time"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-20 rounded-lg border border-[#E5E0D8] px-2 py-1 text-xs text-gray-700 outline-none transition-colors focus:border-[#4E6939]"
    />
  )
}

function MobilePreview({ restaurant, coverUrl }: { restaurant: Restaurant; coverUrl?: string }) {
  return (
    <div
      className="relative mx-auto rounded-[2rem] overflow-hidden"
      style={{
        width: 220,
        height: 440,
        background: '#fff',
        boxShadow: '0 0 0 8px #1A2E0A, 0 20px 48px rgba(0,0,0,0.25)',
      }}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1 bg-[#2D3B1F]">
        <span className="text-[9px] font-semibold text-white">9:41</span>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-white opacity-80" />
          <div className="h-1.5 w-1.5 rounded-full bg-white opacity-80" />
          <div className="h-1.5 w-1.5 rounded-full bg-white" />
        </div>
      </div>

      {/* Hero image */}
      <div className="relative h-[110px] bg-[#F2EDE4]">
        {coverUrl && <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-2 right-2">
          <span className="rounded-full bg-black/50 px-2 py-0.5 text-[8px] font-semibold text-white">
            Voir les 3 photos
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-hidden px-3 py-2 space-y-2 h-[290px]">
        <div>
          <h3 className="text-[11px] font-bold text-gray-900">{restaurant.name}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
            <span className="text-[9px] font-semibold text-gray-900">4,5</span>
            <span className="text-[9px] text-gray-400">· 20 avis</span>
          </div>
          <p className="text-[9px] mt-0.5 text-gray-500">
            {(restaurant as any).cuisine ?? 'Food truck végétal'}
          </p>
        </div>

        {/* Compatible badge */}
        <div className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-2 py-1.5">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500 text-[8px] font-bold text-white">
            ✓
          </div>
          <div>
            <p className="text-[8px] font-semibold text-green-700">Compatible avec</p>
            <p className="text-[8px] text-green-800">vos préférences à 100%</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {['Vegan', 'Végétarien', 'Halal'].map(tag => (
            <span key={tag} className="rounded-full bg-green-100 px-1.5 py-0.5 text-[7px] font-medium text-green-800">
              {tag}
            </span>
          ))}
        </div>

        {/* Info rows */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-2.5 w-2.5 shrink-0 text-gray-400" />
            <span className="truncate text-[8px] text-gray-500">
              {restaurant.address ?? '3 av. du Parmentier, Annecy'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-2.5 w-2.5 shrink-0 text-[#4E6939]" />
            <span className="text-[8px] font-semibold text-[#4E6939]">Ouvert · ferme à 21h00</span>
          </div>
        </div>

        {/* Reserve button */}
        <button className="w-full rounded-xl bg-[#2D3B1F] py-2 text-[9px] font-bold text-[#C8E86A]">
          Réserver une table
        </button>
      </div>
    </div>
  )
}

export default function FichePubliquePage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [photos, setPhotos] = useState<Dish[]>([])
  const [photoAdding, setPhotoAdding] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [priceRange, setPriceRange] = useState('12 à 20 €')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [accessibility, setAccessibility] = useState<Record<string, boolean>>({})
  const [hours, setHours] = useState<Record<string, { open: string; close: string; open2?: string; close2?: string; closed: boolean }>>({})

  useEffect(() => {
    async function load() {
      try {
        const r = await getMyRestaurant()
        setRestaurant(r)
        const dishes = await getDishes(r.id)
        setPhotos(dishes.filter(d => d.category === 'Photo Media'))
        setName(r.name ?? '')
        setCuisine((r as any).cuisine ?? '')
        setPriceRange((r as any).priceRange ?? '12 à 20 €')
        setDescription(r.description ?? '')
        setAddress(r.address ?? '')
        setPhone(r.phone ?? '')

        const acc: Record<string, boolean> = {}
        ACCESSIBILITY_OPTIONS.forEach(o => {
          acc[o.key] = (r.accessibility ?? []).some((a: any) => a.code === o.key)
        })
        setAccessibility(acc)

        const oh = typeof r.openingHours === 'string'
          ? JSON.parse(r.openingHours)
          : (r.openingHours ?? {})
        const defaultHours: Record<string, any> = {}
        DAYS.forEach(d => {
          const raw = oh[d.key]
          defaultHours[d.key] = raw
            ? { ...raw }
            : { open: '09:30', close: '14:30', open2: '19:30', close2: '21:00', closed: false }
        })
        defaultHours['monday'] = { ...defaultHours['monday'], closed: true }
        setHours(defaultHours)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSave() {
    if (!restaurant) return
    setSaving(true)
    setSaveError('')
    try {
      await updateRestaurant(restaurant.id, { name, description, address, phone, cuisine } as any)
      setRestaurant(prev => prev ? { ...prev, name, description, address, phone } : prev)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddPhoto(file: File) {
    if (!restaurant) return
    setPhotoAdding(true)
    setPhotoError('')
    try {
      const imageUrl = await compressImage(file)
      const dish = await createDish(restaurant.id, {
        name: `Photo ${photos.length + 1}`,
        price: 0.01,
        category: 'Photo Media',
        available: false,
        imageUrl,
      })
      setPhotos(prev => [...prev, { ...dish, imageUrl: dish.imageUrl || imageUrl }])
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Impossible d'ajouter la photo.")
    } finally {
      setPhotoAdding(false)
    }
  }

  async function handleRemovePhoto(dish: Dish) {
    if (!restaurant) return
    try {
      await deleteDish(restaurant.id, dish.id)
      setPhotos(prev => prev.filter(p => p.id !== dish.id))
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Impossible de supprimer la photo.")
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
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        Aucun restaurant trouvé pour votre compte.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {saveError && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</div>
      )}
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Fiche publique</h1>
          <p className="text-sm mt-0.5 text-gray-500">Ce que voient les clients dans l&apos;app Yum&apos;me</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-2 rounded-xl border border-[#E5E0D8] bg-white px-4 py-2 text-sm font-medium text-gray-700">
            <ExternalLink className="h-4 w-4" />
            Voir dans l&apos;app
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[#2D3B1F] px-4 py-2 text-sm font-semibold text-[#C8E86A] transition-opacity disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saved ? 'Enregistré !' : 'Publier les modifications'}
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">
        {/* Left column */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Photos */}
          <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
            <h2 className="text-sm font-semibold mb-4 text-gray-900">
              Photos ({photos.length})
            </h2>

            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo, i) => (
                <div key={photo.id} className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-[#F2EDE4]">
                  {photo.imageUrl && (
                    <img src={photo.imageUrl} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo)}
                    className="absolute top-1.5 right-1.5 hidden group-hover:flex items-center justify-center rounded-full bg-black/55 p-1.5 text-white"
                    aria-label="Supprimer"
                  >
                    <X style={{ width: 12, height: 12 }} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={photoAdding}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-[#F9F7F4] text-gray-400 aspect-[4/3] transition-colors hover:border-[#4E6939] hover:text-[#4E6939] disabled:opacity-50"
              >
                {photoAdding
                  ? <Loader2 className="h-6 w-6 animate-spin" />
                  : <><Plus className="h-6 w-6" /><span className="text-xs font-medium">Ajouter</span></>
                }
              </button>
            </div>

            {photoError && (
              <p className="mt-3 text-xs text-red-600">{photoError}</p>
            )}

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async e => {
                const file = e.target.files?.[0]
                if (file) { await handleAddPhoto(file) }
                e.target.value = ''
              }}
            />
          </div>

          {/* Informations */}
          <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
            <h2 className="text-sm font-semibold mb-5 text-gray-900">Informations</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-500">
                  Nom de l&apos;établissement
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E0D8] px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#4E6939]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-500">
                    Type de cuisine
                  </label>
                  <input
                    type="text"
                    value={cuisine}
                    onChange={e => setCuisine(e.target.value)}
                    placeholder="Ex: Food truck végétal"
                    className="w-full rounded-xl border border-[#E5E0D8] px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#4E6939]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-500">
                    Gamme de prix
                  </label>
                  <select
                    value={priceRange}
                    onChange={e => setPriceRange(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-[#E5E0D8] bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#4E6939]"
                  >
                    {PRICE_RANGES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-500">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Décrivez votre restaurant…"
                  className="w-full resize-none rounded-xl border border-[#E5E0D8] px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#4E6939]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-500">Adresse</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full rounded-xl border border-[#E5E0D8] pl-9 pr-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#4E6939]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-500">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="04 50 12 34 56"
                      className="w-full rounded-xl border border-[#E5E0D8] pl-9 pr-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#4E6939]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Horaires d'ouverture */}
          <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                <Clock className="h-4 w-4 shrink-0 text-[#4E6939]" />
                Horaires d&apos;ouverture
              </h2>
              <button className="text-xs font-medium text-[#4E6939]">
                Appliquer à plusieurs jours
              </button>
            </div>

            <div className="space-y-3">
              {DAYS.map(day => {
                const h = hours[day.key] ?? { open: '09:30', close: '14:30', open2: '19:30', close2: '21:00', closed: false }
                return (
                  <div key={day.key} className="flex items-center gap-4">
                    <span className={`w-24 shrink-0 text-sm font-medium ${h.closed ? 'text-gray-400' : 'text-gray-700'}`}>
                      {day.label}
                    </span>

                    {h.closed ? (
                      <span className="flex-1 text-sm text-gray-400">Fermé</span>
                    ) : (
                      <div className="flex flex-1 items-center gap-2 text-sm text-gray-700">
                        <TimeInput
                          value={h.open}
                          onChange={v => setHours(p => ({ ...p, [day.key]: { ...p[day.key], open: v } }))}
                        />
                        <span className="text-gray-400">–</span>
                        <TimeInput
                          value={h.close}
                          onChange={v => setHours(p => ({ ...p, [day.key]: { ...p[day.key], close: v } }))}
                        />
                        {h.open2 && (
                          <>
                            <span className="mx-1 text-gray-300">·</span>
                            <TimeInput
                              value={h.open2 ?? ''}
                              onChange={v => setHours(p => ({ ...p, [day.key]: { ...p[day.key], open2: v } }))}
                            />
                            <span className="text-gray-400">–</span>
                            <TimeInput
                              value={h.close2 ?? ''}
                              onChange={v => setHours(p => ({ ...p, [day.key]: { ...p[day.key], close2: v } }))}
                            />
                          </>
                        )}
                        <button
                          className="ml-1 text-xs text-gray-400"
                          title="Ajouter une plage"
                          onClick={() => setHours(p => ({
                            ...p,
                            [day.key]: p[day.key].open2
                              ? { ...p[day.key], open2: undefined, close2: undefined }
                              : { ...p[day.key], open2: '19:30', close2: '21:00' }
                          }))}
                        >
                          {h.open2 ? '−' : '+'}
                        </button>
                      </div>
                    )}

                    <Toggle
                      checked={!h.closed}
                      onChange={() =>
                        setHours(p => ({ ...p, [day.key]: { ...p[day.key], closed: !p[day.key].closed } }))
                      }
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="w-72 shrink-0 sticky top-6 space-y-5">
          {/* Accessibilité & ambiance */}
          <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
            <h2 className="text-sm font-semibold mb-4 text-gray-900">Accessibilité &amp; ambiance</h2>
            <div className="space-y-3">
              {ACCESSIBILITY_OPTIONS.map(opt => (
                <div key={opt.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{opt.label}</span>
                  <Toggle
                    checked={!!accessibility[opt.key]}
                    onChange={() => setAccessibility(prev => ({ ...prev, [opt.key]: !prev[opt.key] }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Aperçu mobile */}
          <div className="rounded-xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
            <h2 className="text-sm font-semibold mb-4 text-center text-gray-900">Aperçu mobile</h2>
            <MobilePreview restaurant={{ ...restaurant, name, description, address }} coverUrl={photos[0]?.imageUrl} />
            <p className="mt-4 text-center text-xs text-gray-400">
              Aperçu en temps réel de votre fiche client
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
