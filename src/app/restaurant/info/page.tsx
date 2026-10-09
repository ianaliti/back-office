'use client'

import { useEffect, useState } from 'react'
import { getMyRestaurant, updateRestaurant } from '@/lib/api'
import { Loader2, CheckCircle2, ImagePlus, MapPin, Phone, Globe, AlignLeft, Clock, Utensils } from 'lucide-react'
import type { Restaurant, RestaurantFormData, OpeningHours } from '@/types'

const DAYS: { key: keyof OpeningHours; label: string }[] = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
]

const DIET_COLORS: Record<string, { bg: string; text: string }> = {
  vegan:        { bg: '#DCFCE7', text: '#166534' },
  vegetarian:   { bg: '#D1FAE5', text: '#065F46' },
  halal:        { bg: '#FEF3C7', text: '#92400E' },
  kosher:       { bg: '#DBEAFE', text: '#1E40AF' },
  gluten_free:  { bg: '#FEE2E2', text: '#991B1B' },
  lactose_free: { bg: '#F3E8FF', text: '#6B21A8' },
}

function parseHours(raw: Restaurant['openingHours']): Record<string, string> {
  const defaults: Record<string, string> = {
    monday: '', tuesday: '', wednesday: '', thursday: '',
    friday: '', saturday: '', sunday: '',
  }
  if (!raw) return defaults
  if (typeof raw === 'string') {
    try { return { ...defaults, ...(JSON.parse(raw) as Record<string, string>) } } catch { return defaults }
  }
  return { ...defaults, ...(raw as Record<string, string>) }
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
        <span style={{ color: '#9CA3AF' }}>{icon}</span>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
const inputStyle = {
  background: '#FAFAF9',
  border: '1px solid #E5E0D8',
  color: '#111827',
}
const focusStyle = { border: '1px solid #4E6939', boxShadow: '0 0 0 3px rgba(78,105,57,0.08)' }

function TextInput({ value, onChange, placeholder, disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      className={inputCls}
      style={{ ...inputStyle, ...(focused ? focusStyle : {}) }}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

function TextArea({ value, onChange, placeholder, disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      className={inputCls}
      style={{ ...inputStyle, ...(focused ? focusStyle : {}), resize: 'none' }}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={4}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

function HoursEditor({ hours, onChange, disabled }: {
  hours: Record<string, string>
  onChange: (h: Record<string, string>) => void
  disabled?: boolean
}) {
  const [focusedKey, setFocusedKey] = useState<string | null>(null)
  return (
    <div className="space-y-2">
      {DAYS.map(({ key, label }) => {
        const focused = focusedKey === key
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs font-medium" style={{ color: '#374151' }}>
              {label}
            </span>
            <input
              className={inputCls + ' flex-1'}
              style={{ ...inputStyle, ...(focused ? focusStyle : {}) }}
              value={hours[key] ?? ''}
              onChange={e => onChange({ ...hours, [key]: e.target.value })}
              placeholder="09:00 – 22:00  ou  Fermé"
              disabled={disabled}
              onFocus={() => setFocusedKey(key)}
              onBlur={() => setFocusedKey(null)}
            />
          </div>
        )
      })}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl bg-white p-5"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: '#9CA3AF' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

export default function RestaurantInfoPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [description, setDescription] = useState('')
  const [hours, setHours] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      try {
        const mine = await getMyRestaurant()
        setRestaurant(mine)
        setName(mine.name ?? '')
        setCuisine(mine.cuisine ?? '')
        setAddress(mine.address ?? '')
        setLatitude(String(mine.latitude ?? ''))
        setLongitude(String(mine.longitude ?? ''))
        setPhone(mine.phone ?? '')
        setWebsite(mine.website ?? '')
        setDescription(mine.description ?? '')
        setHours(parseHours(mine.openingHours))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSave() {
    if (!restaurant) return
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const data: Partial<RestaurantFormData> = {
        name: name.trim(),
        cuisine: cuisine.trim() || undefined,
        address: address.trim(),
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        description: description.trim() || undefined,
        openingHours: hours,
      }
      await updateRestaurant(restaurant.id, data)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
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
      <div className="rounded-xl p-6 text-sm" style={{ background: '#FEF3C7', color: '#92400E' }}>
        Aucun restaurant trouvé pour votre compte.
      </div>
    )
  }

  return (
    <div className="flex gap-5 items-start">
      {/* ── Left column ── */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Informations générales */}
        <Section title="Informations générales">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nom du restaurant" icon={<Utensils className="h-3.5 w-3.5" />}>
                <TextInput value={name} onChange={setName} placeholder="Le Petit Bistro" disabled={saving} />
              </Field>
              <Field label="Type de cuisine" icon={<Utensils className="h-3.5 w-3.5" />}>
                <TextInput value={cuisine} onChange={setCuisine} placeholder="Française, Italienne…" disabled={saving} />
              </Field>
            </div>
            <Field label="Adresse" icon={<MapPin className="h-3.5 w-3.5" />}>
              <TextInput value={address} onChange={setAddress} placeholder="123 rue de la Paix, Annecy" disabled={saving} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Téléphone" icon={<Phone className="h-3.5 w-3.5" />}>
                <TextInput value={phone} onChange={setPhone} placeholder="+33 4 50 00 00 00" disabled={saving} />
              </Field>
              <Field label="Site web" icon={<Globe className="h-3.5 w-3.5" />}>
                <TextInput value={website} onChange={setWebsite} placeholder="https://example.com" disabled={saving} />
              </Field>
            </div>
            <Field label="Description" icon={<AlignLeft className="h-3.5 w-3.5" />}>
              <TextArea
                value={description}
                onChange={setDescription}
                placeholder="Décrivez votre restaurant à vos clients…"
                disabled={saving}
              />
            </Field>
          </div>
        </Section>

        {/* Régimes alimentaires */}
        {(restaurant.diets?.length ?? 0) > 0 && (
          <Section title="Régimes alimentaires">
            <div className="flex flex-wrap gap-2">
              {restaurant.diets!.map((d) => {
                const style = DIET_COLORS[d.code] ?? { bg: '#F3F4F6', text: '#374151' }
                return (
                  <span
                    key={d.code}
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{ background: style.bg, color: style.text }}
                  >
                    {d.label}
                  </span>
                )
              })}
            </div>
            <p className="mt-3 text-xs" style={{ color: '#9CA3AF' }}>
              Les régimes alimentaires sont gérés par l'administrateur.
            </p>
          </Section>
        )}

        {/* Horaires d'ouverture */}
        <Section title="Horaires d'ouverture">
          <HoursEditor hours={hours} onChange={setHours} disabled={saving} />
        </Section>

        {/* Coordinates (collapsed) */}
        <Section title="Localisation GPS">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude" icon={<MapPin className="h-3.5 w-3.5" />}>
              <TextInput value={latitude} onChange={setLatitude} placeholder="45.8992" disabled={saving} />
            </Field>
            <Field label="Longitude" icon={<MapPin className="h-3.5 w-3.5" />}>
              <TextInput value={longitude} onChange={setLongitude} placeholder="6.1294" disabled={saving} />
            </Field>
          </div>
        </Section>
      </div>

      {/* ── Right column ── */}
      <div className="w-72 shrink-0 space-y-4">

        {/* Photo */}
        <div
          className="rounded-xl bg-white p-5"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: '#9CA3AF' }}>
            Photo
          </p>
          <div
            className="flex flex-col items-center justify-center rounded-xl gap-3 py-10 cursor-pointer transition-colors"
            style={{ border: '2px dashed #E5E0D8', background: '#FAFAF9' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#4E6939')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5E0D8')}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: 'rgba(200,232,106,0.2)' }}
            >
              <ImagePlus className="h-6 w-6" style={{ color: '#4E6939' }} />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium" style={{ color: '#374151' }}>Ajouter une photo</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#9CA3AF' }}>JPG, PNG — max 5 MB</p>
            </div>
          </div>
        </div>

        {/* Restaurant info summary */}
        <div
          className="rounded-xl bg-white p-5 space-y-3"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>
            Aperçu
          </p>
          <div>
            <p className="text-base font-bold" style={{ color: '#111827' }}>
              {name || '—'}
            </p>
            {cuisine && (
              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{cuisine}</p>
            )}
          </div>
          {address && (
            <div className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: '#9CA3AF' }} />
              <p className="text-xs" style={{ color: '#6B7280' }}>{address}</p>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: '#9CA3AF' }} />
              <p className="text-xs" style={{ color: '#6B7280' }}>{phone}</p>
            </div>
          )}
          {website && (
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 shrink-0" style={{ color: '#9CA3AF' }} />
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs truncate hover:underline"
                style={{ color: '#4E6939' }}
              >
                {website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        {/* Save */}
        <div
          className="rounded-xl bg-white p-5"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
        >
          {error && (
            <div className="mb-3 rounded-lg p-3 text-xs" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-3 flex items-center gap-2 rounded-lg p-3 text-xs" style={{ background: '#F0FDF4', color: '#166534' }}>
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              Modifications enregistrées.
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-60"
            style={{ background: '#2D3B1F', color: '#C8E86A' }}
            onMouseEnter={e => !saving && (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…</>
            ) : (
              'Enregistrer les modifications'
            )}
          </button>
          <p className="mt-2.5 text-center text-[10px]" style={{ color: '#9CA3AF' }}>
            Dernière mise à jour : {restaurant.updatedAt
              ? new Date(restaurant.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
              : '—'}
          </p>
        </div>
      </div>
    </div>
  )
}
