import { Pencil } from 'lucide-react'
import type { Dish } from '@/types'
import { DIET_LABEL, ALLERGEN_LABEL } from '@/lib/constants/allergens'

type AllergenStatus = 'garanti' | 'adaptable' | 'risque'

const STATUS_CLASSES: Record<AllergenStatus, string> = {
  garanti:   'bg-green-100 text-green-800',
  adaptable: 'bg-yellow-50 text-yellow-800',
  risque:    'bg-red-100 text-red-800',
}

interface AllergenEntry {
  key: string
  status: AllergenStatus
}

interface DishCardProps {
  dish: Dish
  allergens?: AllergenEntry[]
  diets?: string[]
  onEdit: (dish: Dish) => void
}

export function DishCard({ dish, allergens = [], diets = [], onEdit }: DishCardProps) {
  const confirmedDate = dish.updatedAt ?? dish.createdAt
  const dateLabel = confirmedDate
    ? `Confirmé le ${new Date(confirmedDate).toLocaleDateString('fr-FR')}`
    : 'Confirmé'

  const price = dish.price != null
    ? `${typeof dish.price === 'number' ? dish.price.toFixed(2) : dish.price} €`
    : ''

  return (
    <div className="rounded-xl overflow-hidden bg-white shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
      <div className="relative h-[140px] bg-[#F2EDE4]">
        {dish.imageUrl && (
          <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-800">
          ✓ Publié
        </div>
      </div>

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold leading-snug text-gray-900">{dish.name}</p>
          <p className="shrink-0 text-sm font-semibold text-gray-900">{price}</p>
        </div>

        {dish.category && (
          <p className="text-xs mt-0.5 text-gray-500">{dish.category}</p>
        )}

        {diets.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {diets.map(d => (
              <span
                key={d}
                className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-800 capitalize"
              >
                {DIET_LABEL[d] ?? d.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}

        {allergens.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {allergens.map(({ key, status }) => (
              <span
                key={key}
                className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CLASSES[status]}`}
              >
                {status === 'garanti' ? '✓' : '⚠'} {ALLERGEN_LABEL[key] ?? key}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-gray-400">{dateLabel}</span>
          <button
            onClick={() => onEdit(dish)}
            className="flex items-center justify-center rounded-lg bg-[#F2EDE4] p-1.5 text-[#4E6939]"
            aria-label={`Modifier ${dish.name}`}
          >
            <Pencil style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>
    </div>
  )
}
