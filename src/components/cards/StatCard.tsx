import { TrendingUp } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number | string
  subtitle: string
}

export function StatCard({ label, value, subtitle }: StatCardProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
      <p className="text-xs mb-1 text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <div className="flex items-center gap-1 mt-1.5">
        <TrendingUp className="h-3.5 w-3.5 text-[#4E6939]" />
        <span className="text-xs text-[#4E6939]">{subtitle}</span>
      </div>
    </div>
  )
}
