'use client'

import { useEffect, useState } from 'react'
import { getMyRestaurant, updateRestaurant } from '@/lib/api'
import {
  Loader2, ExternalLink, Upload, Plus, Star, ChevronRight,
  MapPin, Phone, Clock, Camera, Info,
} from 'lucide-react'
import type { Restaurant } from '@/types'

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

const PLACEHOLDER_PHOTOS = [
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&q=80',
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors"
      style={{ background: checked ? '#4E6939' : '#D1D5DB' }}
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

function MobilePreview({ restaurant }: { restaurant: Restaurant }) {
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
      <div className="flex items-center justify-between px-4 pt-2 pb-1" style={{ background: '#2D3B1F' }}>
        <span className="text-[9px] font-semibold text-white">9:41</span>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-white opacity-80" />
          <div className="h-1.5 w-1.5 rounded-full bg-white opacity-80" />
          <div className="h-1.5 w-1.5 rounded-full bg-white" />
        </div>
      </div>

      {/* Hero image */}
      <div className="relative" style={{ height: 110 }}>
        <img
          src={PLACEHOLDER_PHOTOS[0]}
          alt="cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }} />
        <div className="absolute bottom-2 right-2">
          <span
            className="rounded-full px-2 py-0.5 text-[8px] font-semibold text-white"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            Voir les 3 photos
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-2 space-y-2 overflow-hidden" style={{ height: 290 }}>
        <div>
          <h3 className="text-[11px] font-bold" style={{ color: '#111827' }}>
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="h-2.5 w-2.5" style={{ color: '#F59E0B', fill: '#F59E0B' }} />
            <span className="text-[9px] font-semibold" style={{ color: '#111827' }}>4,5</span>
            <span className="text-[9px]" style={{ color: '#9CA3AF' }}>· 20 avis</span>
          </div>
          <p className="text-[9px] mt-0.5" style={{ color: '#6B7280' }}>
            {(restaurant as any).cuisine ?? 'Food truck végétal'}
          </p>
        </div>

        {/* Compatible badge */}
        <div
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5"
          style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
        >
          <div
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold"
            style={{ background: '#22C55E', color: 'white' }}
          >
            ✓
          </div>
          <div>
            <p className="text-[8px] font-semibold" style={{ color: '#15803D' }}>Compatible avec</p>
            <p className="text-[8px]" style={{ color: '#166534' }}>vos préférences à 100%</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {['Vegan', 'Végétarien', 'Halal'].map(tag => (
            <span
              key={tag}
              className="rounded-full px-1.5 py-0.5 text-[7px] font-medium"
              style={{ background: '#D1FAE5', color: '#065F46' }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Info rows */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-2.5 w-2.5 shrink-0" style={{ color: '#9CA3AF' }} />
            <span className="text-[8px] truncate" style={{ color: '#6B7280' }}>
              {restaurant.address ?? '3 av. du Parmentier, Annecy'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-2.5 w-2.5 shrink-0" style={{ color: '#4E6939' }} />
            <span className="text-[8px]" style={{ color: '#4E6939', fontWeight: 600 }}>
              Ouvert · ferme à 21h00
            </span>
          </div>
        </div>

        {/* Reserve button */}
        <button
          className="w-full rounded-xl py-2 text-[9px] font-bold"
          style={{ background: '#2D3B1F', color: '#C8E86A' }}
        >
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

  // Form state
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
        setName(r.name ?? '')
        setCuisine((r as any).cuisine ?? '')
        setPriceRange((r as any).priceRange ?? '12 à 20 €')
        setDescription(r.description ?? '')
        setAddress(r.address ?? '')
        setPhone(r.phone ?? '')

        // Accessibility
        const acc: Record<string, boolean> = {}
        ACCESSIBILITY_OPTIONS.forEach(o => {
          acc[o.key] = (r.accessibility ?? []).some((a: any) => a.code === o.key)
        })
        setAccessibility(acc)

        // Opening hours
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
    try {
      await updateRestaurant(restaurant.id, {
        name,
        description,
        address,
        phone,
        cuisine,
      } as any)
      setRestaurant(prev => prev ? { ...prev, name, description, address, phone } : prev)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      // silently ignore
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#4E6939' }} />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="rounded-xl px-4 py-3 text-sm" style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' }}>
        Aucun restaurant trouvé pour votre compte.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: '#111827' }}>Fiche publique</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
            Ce que voient les clients dans l'app Yum'me
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-opacity"
            style={{ border: '1px solid #E5E0D8', background: 'white', color: '#374151' }}
          >
            <ExternalLink className="h-4 w-4" />
            Voir dans l'app
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-60"
            style={{ background: '#2D3B1F', color: '#C8E86A' }}
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
          <div className="rounded-xl bg-white p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: '#111827' }}>
                Photos ({PLACEHOLDER_PHOTOS.length})
              </h2>
              <button className="text-xs font-medium" style={{ color: '#4E6939' }}>
                Gérer vos photos
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {PLACEHOLDER_PHOTOS.map((src, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  <img src={src} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
                  <div
                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.35)' }}
                  >
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>
              ))}
              <button
                className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-xs font-medium transition-colors"
                style={{
                  aspectRatio: '4/3',
                  borderColor: '#D1D5DB',
                  color: '#9CA3AF',
                  background: '#FAFAFA',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#4E6939'
                  e.currentTarget.style.color = '#4E6939'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#D1D5DB'
                  e.currentTarget.style.color = '#9CA3AF'
                }}
              >
                <Plus className="h-5 w-5" />
                Ajouter des photos
              </button>
            </div>

            {/* Info banner */}
            <div
              className="mt-4 flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-xs"
              style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
            >
              <Info className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#D97706' }} />
              <p style={{ color: '#92400E' }}>
                Les fiches avec au moins 4 photos reçoivent <strong>3x plus de réservations</strong>. Les photos de couverture sont prioritaires dans l'app.
              </p>
            </div>
          </div>

          {/* Informations */}
          <div className="rounded-xl bg-white p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <h2 className="text-sm font-semibold mb-5" style={{ color: '#111827' }}>
              Informations
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
                  Nom de l'établissement
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors"
                  style={{ borderColor: '#E5E0D8', color: '#111827' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#4E6939')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#E5E0D8')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
                    Type de cuisine
                  </label>
                  <input
                    type="text"
                    value={cuisine}
                    onChange={e => setCuisine(e.target.value)}
                    placeholder="Ex: Food truck végétal"
                    className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors"
                    style={{ borderColor: '#E5E0D8', color: '#111827' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#4E6939')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#E5E0D8')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
                    Gamme de prix
                  </label>
                  <select
                    value={priceRange}
                    onChange={e => setPriceRange(e.target.value)}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors appearance-none bg-white"
                    style={{ borderColor: '#E5E0D8', color: '#111827' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#4E6939')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#E5E0D8')}
                  >
                    {PRICE_RANGES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Décrivez votre restaurant…"
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors resize-none"
                  style={{ borderColor: '#E5E0D8', color: '#111827' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#4E6939')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#E5E0D8')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
                    Adresse
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#9CA3AF' }} />
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full rounded-xl border pl-9 pr-3.5 py-2.5 text-sm outline-none transition-colors"
                      style={{ borderColor: '#E5E0D8', color: '#111827' }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#4E6939')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#E5E0D8')}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#9CA3AF' }} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="04 50 12 34 56"
                      className="w-full rounded-xl border pl-9 pr-3.5 py-2.5 text-sm outline-none transition-colors"
                      style={{ borderColor: '#E5E0D8', color: '#111827' }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#4E6939')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#E5E0D8')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Horaires d'ouverture */}
          <div className="rounded-xl bg-white p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#111827' }}>
                <Clock className="h-4 w-4 shrink-0" style={{ color: '#4E6939' }} />
                Horaires d'ouverture
              </h2>
              <button className="text-xs font-medium" style={{ color: '#4E6939' }}>
                Appliquer à plusieurs jours
              </button>
            </div>

            <div className="space-y-3">
              {DAYS.map(day => {
                const h = hours[day.key] ?? { open: '09:30', close: '14:30', open2: '19:30', close2: '21:00', closed: false }
                return (
                  <div key={day.key} className="flex items-center gap-4">
                    <span
                      className="w-24 shrink-0 text-sm font-medium"
                      style={{ color: h.closed ? '#9CA3AF' : '#374151' }}
                    >
                      {day.label}
                    </span>

                    {h.closed ? (
                      <span className="flex-1 text-sm" style={{ color: '#9CA3AF' }}>Fermé</span>
                    ) : (
                      <div className="flex flex-1 items-center gap-2 text-sm" style={{ color: '#374151' }}>
                        <TimeInput
                          value={h.open}
                          onChange={v => setHours(p => ({ ...p, [day.key]: { ...p[day.key], open: v } }))}
                        />
                        <span style={{ color: '#9CA3AF' }}>–</span>
                        <TimeInput
                          value={h.close}
                          onChange={v => setHours(p => ({ ...p, [day.key]: { ...p[day.key], close: v } }))}
                        />
                        {h.open2 && (
                          <>
                            <span className="mx-1" style={{ color: '#D1D5DB' }}>·</span>
                            <TimeInput
                              value={h.open2 ?? ''}
                              onChange={v => setHours(p => ({ ...p, [day.key]: { ...p[day.key], open2: v } }))}
                            />
                            <span style={{ color: '#9CA3AF' }}>–</span>
                            <TimeInput
                              value={h.close2 ?? ''}
                              onChange={v => setHours(p => ({ ...p, [day.key]: { ...p[day.key], close2: v } }))}
                            />
                          </>
                        )}
                        <button
                          className="ml-1 text-xs"
                          style={{ color: '#9CA3AF' }}
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

        {/* Right column — accessibility + mobile preview */}
        <div className="shrink-0 w-72 sticky top-6 space-y-5">
          {/* Accessibilité & ambiance */}
          <div className="rounded-xl bg-white p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>
              Accessibilité &amp; ambiance
            </h2>
            <div className="space-y-3">
              {ACCESSIBILITY_OPTIONS.map(opt => (
                <div key={opt.key} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#374151' }}>{opt.label}</span>
                  <Toggle
                    checked={!!accessibility[opt.key]}
                    onChange={() =>
                      setAccessibility(prev => ({ ...prev, [opt.key]: !prev[opt.key] }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Aperçu mobile */}
          <div
            className="rounded-xl bg-white p-5"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
          >
            <h2 className="text-sm font-semibold mb-4 text-center" style={{ color: '#111827' }}>
              Aperçu mobile
            </h2>
            <MobilePreview restaurant={{ ...restaurant, name, description, address }} />
            <p className="mt-4 text-center text-xs" style={{ color: '#9CA3AF' }}>
              Aperçu en temps réel de votre fiche client
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="time"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="rounded-lg border px-2 py-1 text-xs outline-none transition-colors"
      style={{ borderColor: '#E5E0D8', color: '#374151', width: 80 }}
      onFocus={e => (e.currentTarget.style.borderColor = '#4E6939')}
      onBlur={e => (e.currentTarget.style.borderColor = '#E5E0D8')}
    />
  )
}
