interface Tab {
  key: string
  label: string
  count: number
}

interface CategoryTabsProps {
  tabs: Tab[]
  activeKey: string
  onChange: (key: string) => void
}

export function CategoryTabs({ tabs, activeKey, onChange }: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            activeKey === tab.key
              ? 'bg-[#2D3B1F] text-[#C8E86A]'
              : 'bg-transparent text-gray-500'
          }`}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  )
}
