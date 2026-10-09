import { ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle: string
  primaryAction: ReactNode
}

export function PageHeader({ title, subtitle, primaryAction }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm mt-1 text-gray-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2.5">
        <button className="flex items-center gap-2 rounded-xl border border-[#E5E0D8] bg-white px-4 py-2 text-sm font-medium text-gray-700">
          <ExternalLink className="h-4 w-4" />
          Voir dans l&apos;app
        </button>
        {primaryAction}
      </div>
    </div>
  )
}
