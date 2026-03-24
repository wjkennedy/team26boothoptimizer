'use client'

import { StrategyType } from '@/hooks/use-route-calculator'

interface StrategyToggleProps {
  activeStrategy: StrategyType
  onStrategyChange: (strategy: StrategyType) => void
}

const strategies: { id: StrategyType; label: string; description: string; badge?: string }[] =
  [
    {
      id: 'serpentine',
      label: 'Serpentine',
      description: 'Row-by-row sweeping motion',
    },
    {
      id: 'big-to-small',
      label: 'Big to Small',
      description: 'Swag-motivated (largest booths first)',
    },
    {
      id: 'expofp',
      label: 'ExpoFP Optimized',
      description: 'TSP heuristic matching getOptimizedRoutes()',
      badge: 'new',
    },
    {
      id: 'quest',
      label: 'Quest Mode',
      description: 'Atlassian quest sequence',
      badge: 'soon',
    },
  ]

export function StrategyToggle({
  activeStrategy,
  onStrategyChange,
}: StrategyToggleProps) {
  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Routing Strategy
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {strategies.map((strategy) => (
          <button
            key={strategy.id}
            onClick={() => onStrategyChange(strategy.id)}
            disabled={strategy.id === 'quest'}
            className={`relative p-4 rounded-lg border-2 transition-all text-left ${
              activeStrategy === strategy.id
                ? 'border-primary bg-primary/10 shadow-lg'
                : strategy.id === 'quest'
                  ? 'border-border bg-card opacity-50 cursor-not-allowed'
                  : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex items-start justify-between gap-1 mb-1">
              <div className="font-semibold text-foreground text-sm leading-tight">{strategy.label}</div>
              {strategy.badge && (
                <span className={`flex-shrink-0 text-xs font-medium px-1.5 py-0.5 rounded ${
                  strategy.badge === 'new'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {strategy.badge}
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {strategy.description}
            </div>
            {activeStrategy === strategy.id && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
