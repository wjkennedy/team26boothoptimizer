'use client'

import { StrategyType } from '@/hooks/use-route-calculator'

interface StrategyToggleProps {
  activeStrategy: StrategyType
  onStrategyChange: (strategy: StrategyType) => void
}

const strategies: {
  id: StrategyType
  label: string
  shortLabel: string
  description: string
  badge?: string
  disabled?: boolean
}[] = [
  {
    id: 'serpentine',
    label: 'Serpentine',
    shortLabel: 'Serpentine',
    description: 'Row-by-row sweep, alternating direction. Minimises backtracking across the whole floor.',
  },
  {
    id: 'big-to-small',
    label: 'Big to Small',
    shortLabel: 'Big → Small',
    description: 'Prioritises large booths first, then fills in smaller ones. Good for maximising high-value stops early.',
  },
  {
    id: 'expofp',
    label: 'ExpoFP Optimized',
    shortLabel: 'ExpoFP TSP',
    description: 'Mirrors getOptimizedRoutes() — tries nearest-neighbor from every start point, picks the shortest total path.',
    badge: 'new',
  },
  {
    id: 'quest',
    label: 'Quest Mode',
    shortLabel: 'Quest',
    description: 'A curated sequence designated by Atlassian. Complete it to claim a Team t-shirt.',
    badge: 'soon',
    disabled: true,
  },
]

export function StrategyToggle({
  activeStrategy,
  onStrategyChange,
}: StrategyToggleProps) {
  const active = strategies.find(s => s.id === activeStrategy)

  return (
    <div className="w-full space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Routing Strategy</h2>

      {/* Compact pill bar */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg flex-wrap">
        {strategies.map((s) => (
          <button
            key={s.id}
            onClick={() => !s.disabled && onStrategyChange(s.id)}
            disabled={s.disabled}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              activeStrategy === s.id
                ? 'bg-card text-foreground shadow-sm'
                : s.disabled
                  ? 'text-muted-foreground/50 cursor-not-allowed'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            {s.shortLabel}
            {s.badge && (
              <span className={`text-[10px] font-semibold px-1 py-0.5 rounded leading-none ${
                s.badge === 'new'
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted-foreground/20 text-muted-foreground'
              }`}>
                {s.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Description for active strategy */}
      {active && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">{active.label}: </span>
          {active.description}
        </p>
      )}
    </div>
  )
}
