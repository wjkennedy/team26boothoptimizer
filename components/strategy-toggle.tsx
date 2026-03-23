'use client'

import { StrategyType } from '@/hooks/use-route-calculator'

interface StrategyToggleProps {
  activeStrategy: StrategyType
  onStrategyChange: (strategy: StrategyType) => void
}

const strategies: { id: StrategyType; label: string; description: string }[] =
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
      id: 'quest',
      label: 'Quest Mode',
      description: 'Atlassian quest sequence',
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {strategies.map((strategy) => (
          <button
            key={strategy.id}
            onClick={() => onStrategyChange(strategy.id)}
            className={`relative p-4 rounded-lg border-2 transition-all ${
              activeStrategy === strategy.id
                ? 'border-primary bg-primary/10 shadow-lg'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="text-left">
              <div className="font-semibold text-foreground">{strategy.label}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {strategy.description}
              </div>
            </div>
            {activeStrategy === strategy.id && (
              <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
