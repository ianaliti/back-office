'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ImagePlus, X } from 'lucide-react'
import type { Dish, DishFormData } from '@/types'

interface DishFormProps {
  initial?: Partial<Dish>
  onSubmit: (data: DishFormData) => Promise<void>
  onCancel: () => void
  submitLabel?: string
  loading?: boolean
}

const CATEGORIES = [
  'Entrées',
  'Plats',
  'Accompagnements',
  'Desserts',
  'Boissons',
  'Autres',
]

const inputClass = 'w-full rounded-xl border border-[#E5E0D8] bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#4E6939]'
const labelClass = 'block text-xs font-medium text-gray-500 mb-1.5'

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

export function DishForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Enregistrer',
  loading = false,
}: DishFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [price, setPrice] = useState(initial?.price?.toString() ?? '')
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[1])
  const [available, setAvailable] = useState(initial?.available ?? true)
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function loadFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const compressed = await compressImage(file)
    setImageUrl(compressed)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) loadFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) loadFile(file)
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Le nom est requis'
    if (!price) {
      newErrors.price = 'Le prix est requis'
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Le prix doit être supérieur à 0'
    }
    if (!category) newErrors.category = 'La catégorie est requise'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      price: Number(price),
      category,
      available,
      imageUrl: imageUrl.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Photo upload */}
      <div>
        <label className={labelClass}>Photo du plat</label>

        {imageUrl ? (
          <div className="relative rounded-xl overflow-hidden h-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Aperçu" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => { setImageUrl(''); if (fileInputRef.current) fileInputRef.current.value = '' }}
              className="absolute top-2 right-2 flex items-center justify-center rounded-full bg-black/50 p-1.5 text-white"
              title="Supprimer la photo"
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg bg-black/55 px-2.5 py-1.5 text-xs font-medium text-white"
            >
              <ImagePlus style={{ width: 13, height: 13 }} />
              Changer
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors h-[130px] ${
              dragOver
                ? 'border-[#4E6939] bg-[#4E6939]/5 text-[#4E6939]'
                : 'border-gray-300 bg-[#FAFAFA] text-gray-400'
            }`}
          >
            <ImagePlus style={{ width: 24, height: 24 }} />
            <div className="text-center">
              <p className="text-sm font-medium">Cliquer ou glisser une photo</p>
              <p className="text-xs mt-0.5">PNG, JPG, WEBP — max 5 Mo</p>
            </div>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={loading}
        />
      </div>

      {/* Nom */}
      <div>
        <label className={labelClass}>Nom du plat</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex : Burger Avocat"
          disabled={loading}
          className={inputClass}
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>
          Description <span className="text-gray-400">(optionnel)</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Ingrédients, mode de préparation…"
          rows={2}
          disabled={loading}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Prix + Catégorie */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Prix (€)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="12,50"
            disabled={loading}
            className={inputClass}
          />
          {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
        </div>

        <div>
          <label className={labelClass}>Catégorie</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            disabled={loading}
            className={`${inputClass} appearance-auto`}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
        </div>
      </div>

      {/* Disponible */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={available}
          onClick={() => setAvailable(!available)}
          disabled={loading}
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${available ? 'bg-[#4E6939]' : 'bg-gray-300'}`}
        >
          <span
            className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
            style={{ transform: available ? 'translateX(18px)' : 'translateX(2px)' }}
          />
        </button>
        <span className="text-sm text-gray-700">Disponible à la commande</span>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-[#E5E0D8] bg-white px-4 py-2 text-sm font-medium text-gray-700"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-[#2D3B1F] px-4 py-2 text-sm font-semibold text-[#C8E86A] disabled:opacity-60"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
