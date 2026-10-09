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

  function loadFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
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
    } else if (isNaN(Number(price)) || Number(price) < 0) {
      newErrors.price = 'Prix invalide'
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: '0.75rem',
    border: '1px solid #E5E0D8',
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    color: '#111827',
    background: 'white',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#6B7280',
    marginBottom: '0.375rem',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Photo upload */}
      <div>
        <label style={labelStyle}>Photo du plat</label>

        {imageUrl ? (
          <div className="relative rounded-xl overflow-hidden" style={{ height: 160 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Aperçu" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => { setImageUrl(''); if (fileInputRef.current) fileInputRef.current.value = '' }}
              className="absolute top-2 right-2 flex items-center justify-center rounded-full p-1.5"
              style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}
              title="Supprimer la photo"
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium"
              style={{ background: 'rgba(0,0,0,0.55)', color: 'white' }}
            >
              <ImagePlus style={{ width: 13, height: 13 }} />
              Changer
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors"
            style={{
              height: 130,
              borderColor: dragOver ? '#4E6939' : '#D1D5DB',
              background: dragOver ? 'rgba(78,105,57,0.04)' : '#FAFAFA',
              color: dragOver ? '#4E6939' : '#9CA3AF',
              cursor: 'pointer',
            }}
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
        <label style={labelStyle}>Nom du plat</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex : Burger Avocat"
          disabled={loading}
          style={inputStyle}
          onFocus={e => (e.currentTarget.style.borderColor = '#4E6939')}
          onBlur={e => (e.currentTarget.style.borderColor = '#E5E0D8')}
        />
        {errors.name && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label style={labelStyle}>Description <span style={{ color: '#9CA3AF' }}>(optionnel)</span></label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ingrédients, mode de préparation…"
          rows={2}
          disabled={loading}
          style={{ ...inputStyle, resize: 'none' }}
          onFocus={e => (e.currentTarget.style.borderColor = '#4E6939')}
          onBlur={e => (e.currentTarget.style.borderColor = '#E5E0D8')}
        />
      </div>

      {/* Prix + Catégorie */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={labelStyle}>Prix (€)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="12,50"
            disabled={loading}
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = '#4E6939')}
            onBlur={e => (e.currentTarget.style.borderColor = '#E5E0D8')}
          />
          {errors.price && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.price}</p>}
        </div>

        <div>
          <label style={labelStyle}>Catégorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
            style={{ ...inputStyle, appearance: 'auto' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#4E6939')}
            onBlur={e => (e.currentTarget.style.borderColor = '#E5E0D8')}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.category}</p>}
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
          className="relative inline-flex items-center rounded-full transition-colors"
          style={{
            width: 36,
            height: 20,
            background: available ? '#4E6939' : '#D1D5DB',
            flexShrink: 0,
          }}
        >
          <span
            className="inline-block rounded-full bg-white shadow transition-transform"
            style={{
              width: 14,
              height: 14,
              transform: available ? 'translateX(18px)' : 'translateX(2px)',
            }}
          />
        </button>
        <span className="text-sm" style={{ color: '#374151' }}>
          Disponible à la commande
        </span>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl px-4 py-2 text-sm font-medium"
          style={{ border: '1px solid #E5E0D8', background: 'white', color: '#374151' }}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60"
          style={{ background: '#2D3B1F', color: '#C8E86A' }}
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
