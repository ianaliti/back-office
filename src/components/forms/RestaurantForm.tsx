'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Restaurant, RestaurantFormData } from '@/types'

interface RestaurantFormProps {
  initial?: Partial<Restaurant>
  onSubmit: (data: RestaurantFormData) => Promise<void>
  submitLabel?: string
  loading?: boolean
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
type Day = (typeof DAYS)[number]

function parseOpeningHours(raw: Restaurant['openingHours']): Record<Day, string> {
  const defaults: Record<Day, string> = {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: '',
  }
  if (!raw) return defaults
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as Record<string, string>
      return { ...defaults, ...parsed }
    } catch {
      return defaults
    }
  }
  return { ...defaults, ...raw }
}

export function RestaurantForm({
  initial,
  onSubmit,
  submitLabel = 'Save',
  loading = false,
}: RestaurantFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [website, setWebsite] = useState(initial?.website ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [cuisine, setCuisine] = useState(initial?.cuisine ?? '')
  const [openingHours, setOpeningHours] = useState<Record<Day, string>>(
    parseOpeningHours(initial?.openingHours)
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!address.trim()) newErrors.address = 'Address is required'
    if (!phone.trim()) newErrors.phone = 'Phone is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const data: RestaurantFormData = {
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      website: website.trim() || undefined,
      description: description.trim() || undefined,
      cuisine: cuisine.trim() || undefined,
      openingHours,
    }
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Restaurant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Restaurant"
          error={errors.name}
          disabled={loading}
        />
        <Input
          label="Cuisine"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          placeholder="Italian, French, ..."
          disabled={loading}
        />
      </div>

      <Input
        label="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="123 Main St, City"
        error={errors.address}
        disabled={loading}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 555 000 0000"
          error={errors.phone}
          disabled={loading}
        />
        <Input
          label="Website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.com"
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell customers about your restaurant..."
          rows={3}
          disabled={loading}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#685ED7]/40 focus:border-[#685ED7] disabled:opacity-50"
        />
      </div>

      {/* Opening Hours */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Opening Hours</h3>
        <div className="grid gap-2">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center gap-3">
              <span className="w-24 text-sm capitalize text-gray-600">{day}</span>
              <Input
                value={openingHours[day]}
                onChange={(e) =>
                  setOpeningHours((prev) => ({ ...prev, [day]: e.target.value }))
                }
                placeholder="9:00 AM - 10:00 PM"
                disabled={loading}
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
