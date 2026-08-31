'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import type { Restaurant, RestaurantFormData, User } from '@/types'

export interface OwnerCredentials {
  email: string
  password: string
}

interface RestaurantFormProps {
  initial?: Partial<Restaurant>
  owners?: User[]
  mode?: 'create' | 'edit'
  onSubmit: (data: RestaurantFormData, ownerCreds?: OwnerCredentials) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  loading?: boolean
  error?: string
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
type Day = (typeof DAYS)[number]

function parseOpeningHours(raw: Restaurant['openingHours']): Record<Day, string> {
  const defaults: Record<Day, string> = {
    monday: '', tuesday: '', wednesday: '', thursday: '',
    friday: '', saturday: '', sunday: '',
  }
  if (!raw) return defaults
  if (typeof raw === 'string') {
    try { return { ...defaults, ...(JSON.parse(raw) as Record<string, string>) } } catch { return defaults }
  }
  return { ...defaults, ...(raw as Record<string, string>) }
}

export function RestaurantForm({
  initial,
  owners = [],
  mode = 'edit',
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  loading = false,
  error,
}: RestaurantFormProps) {
  const isCreate = mode === 'create'

  // Owner account fields (create mode only)
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Restaurant fields
  const [ownerId, setOwnerId] = useState(initial?.ownerId ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [latitude, setLatitude] = useState(String(initial?.latitude ?? ''))
  const [longitude, setLongitude] = useState(String(initial?.longitude ?? ''))
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [website, setWebsite] = useState(initial?.website ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [cuisine, setCuisine] = useState(initial?.cuisine ?? '')
  const [openingHours, setOpeningHours] = useState<Record<Day, string>>(
    parseOpeningHours(initial?.openingHours)
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'

    if (isCreate) {
      if (!ownerEmail.trim()) errs.ownerEmail = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail.trim()))
        errs.ownerEmail = 'Enter a valid email'
      if (!ownerPassword) errs.ownerPassword = 'Password is required'
      else if (ownerPassword.length < 8) errs.ownerPassword = 'At least 8 characters'
    } else {
      // Edit mode — address and coordinates are required
      if (!address.trim()) errs.address = 'Address is required'
      const lat = parseFloat(latitude)
      const lng = parseFloat(longitude)
      if (latitude === '' || isNaN(lat) || lat < -90 || lat > 90)
        errs.latitude = 'Enter a valid latitude (−90 to 90)'
      if (longitude === '' || isNaN(lng) || lng < -180 || lng > 180)
        errs.longitude = 'Enter a valid longitude (−180 to 180)'
    }

    if (website.trim() && !/^https?:\/\/.+/.test(website.trim()))
      errs.website = 'Must start with http:// or https://'

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)

    const data: RestaurantFormData = {
      name: name.trim(),
      address: address.trim(),
      latitude: isNaN(lat) ? 0 : lat,
      longitude: isNaN(lng) ? 0 : lng,
      phone: phone.trim() || undefined,
      website: website.trim() || undefined,
      description: description.trim() || undefined,
      cuisine: cuisine.trim() || undefined,
      ownerId: ownerId || undefined,
      openingHours,
    }

    if (isCreate) {
      await onSubmit(data, { email: ownerEmail.trim(), password: ownerPassword })
    } else {
      await onSubmit(data)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Owner account (create mode only) ── */}
      {isCreate && (
        <div className="rounded-lg border border-[#4E6939]/20 bg-[#4E6939]/5 p-4 space-y-4">
          <p className="text-sm font-semibold text-[#4E6939]">Owner login credentials</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Owner email *"
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              placeholder="owner@restaurant.com"
              error={fieldErrors.ownerEmail}
              disabled={loading}
              autoComplete="off"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  disabled={loading}
                  autoComplete="new-password"
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4E6939] focus:outline-none focus:ring-1 focus:ring-[#4E6939] disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.ownerPassword && (
                <p className="text-xs text-red-600">{fieldErrors.ownerPassword}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Restaurant details ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Restaurant name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Le Petit Bistro"
          error={fieldErrors.name}
          disabled={loading}
        />
        <Input
          label="Cuisine"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          placeholder="French, Italian, …"
          disabled={loading}
        />
      </div>

      <Input
        label={isCreate ? 'Address' : 'Address *'}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="123 Main Street, City"
        error={fieldErrors.address}
        disabled={loading}
        hint={isCreate ? 'Can be filled in later by the owner' : undefined}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={isCreate ? 'Latitude' : 'Latitude *'}
          type="number"
          step="any"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          placeholder="45.8992"
          error={fieldErrors.latitude}
          hint={isCreate ? 'Optional — e.g. 45.8992' : 'e.g. 45.8992 for Annecy'}
          disabled={loading}
        />
        <Input
          label={isCreate ? 'Longitude' : 'Longitude *'}
          type="number"
          step="any"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          placeholder="6.1294"
          error={fieldErrors.longitude}
          hint={isCreate ? 'Optional — e.g. 6.1294' : 'e.g. 6.1294 for Annecy'}
          disabled={loading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+33 4 50 00 00 00"
          disabled={loading}
        />
        <Input
          label="Website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.com"
          error={fieldErrors.website}
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell customers about this restaurant…"
          rows={3}
          disabled={loading}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4E6939]/40 focus:border-[#4E6939] disabled:opacity-50"
        />
      </div>

      {/* Owner reassignment — edit mode only */}
      {!isCreate && owners.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Assign to owner</label>
          <select
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            disabled={loading}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E6939]/40 focus:border-[#4E6939] disabled:opacity-50"
          >
            <option value="">— No owner —</option>
            {owners.map((u) => (
              <option key={u.id} value={u.id}>
                {u.displayName ? `${u.displayName} (${u.email})` : u.email}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Opening Hours</h3>
        <div className="grid gap-2">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center gap-3">
              <span className="w-24 text-sm capitalize text-gray-600">{day}</span>
              <Input
                value={openingHours[day]}
                onChange={(e) => setOpeningHours((prev) => ({ ...prev, [day]: e.target.value }))}
                placeholder="9:00 AM – 10:00 PM"
                disabled={loading}
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
