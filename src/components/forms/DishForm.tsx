'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Dish, DishFormData } from '@/types'

interface DishFormProps {
  initial?: Partial<Dish>
  onSubmit: (data: DishFormData) => Promise<void>
  onCancel: () => void
  submitLabel?: string
  loading?: boolean
}

const CATEGORIES = [
  'Appetizer',
  'Main Course',
  'Dessert',
  'Drink',
  'Side Dish',
  'Soup',
  'Salad',
  'Pizza',
  'Burger',
  'Pasta',
  'Seafood',
  'Other',
]

export function DishForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save Dish',
  loading = false,
}: DishFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [price, setPrice] = useState(initial?.price?.toString() ?? '')
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0])
  const [available, setAvailable] = useState(initial?.available ?? true)
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!price) {
      newErrors.price = 'Price is required'
    } else if (isNaN(Number(price)) || Number(price) < 0) {
      newErrors.price = 'Price must be a valid positive number'
    }
    if (!category) newErrors.category = 'Category is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const data: DishFormData = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: Number(price),
      category,
      available,
      imageUrl: imageUrl.trim() || undefined,
    }
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Dish name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Margherita Pizza"
        error={errors.name}
        disabled={loading}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the dish..."
          rows={2}
          disabled={loading}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4E6939]/40 focus:border-[#4E6939] disabled:opacity-50"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Price ($)"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="9.99"
          error={errors.price}
          disabled={loading}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E6939]/40 focus:border-[#4E6939] disabled:opacity-50"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
        </div>
      </div>

      <Input
        label="Image URL (optional)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="https://example.com/dish.jpg"
        disabled={loading}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={available}
          onClick={() => setAvailable(!available)}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4E6939]/40 ${
            available ? 'bg-[#4E6939]' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              available ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-sm text-gray-700">Available to order</span>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
