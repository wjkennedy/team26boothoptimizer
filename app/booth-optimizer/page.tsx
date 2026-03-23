'use client'

import { useEffect } from 'react'
import { StrategyToggle } from '@/components/strategy-toggle'
import { BoothList } from '@/components/booth-list'
import { useRouteCalculator } from '@/hooks/use-route-calculator'
import { mockBooths } from '@/lib/booth-data'

export default function BoothOptimizerPage() {
  const { strategy, route, calculateRoute, initializeRoute } =
    useRouteCalculator({ booths: mockBooths })

  useEffect(() => {
    initializeRoute()
  }, [initializeRoute])

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Team '26 Booth Optimizer
          </h1>
          <p className="text-muted-foreground">
            Find the most efficient route through all booths. Maximize your booth
            visits while minimizing walking distance.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Strategy Selection */}
          <div className="space-y-6">
            <StrategyToggle
              activeStrategy={strategy}
              onStrategyChange={calculateRoute}
            />

            {/* Strategy Info */}
            <div className="p-4 bg-card rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">
                {strategy === 'serpentine'
                  ? 'Serpentine Route'
                  : strategy === 'big-to-small'
                    ? 'Big to Small'
                    : 'Quest Mode'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {strategy === 'serpentine'
                  ? 'Systematically sweeps through each row of booths left to right, then right to left. Minimizes backtracking for steady coverage.'
                  : strategy === 'big-to-small'
                    ? 'Prioritizes larger booths first for maximum swag potential, then fills in the gaps with smaller booths using an optimized path.'
                    : 'Follows Atlassian\'s curated quest sequence to hit strategic booths in the ideal order for your mission.'}
              </p>
            </div>
          </div>

          {/* Right: Booth List */}
          <div>
            <BoothList route={route} />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-card rounded-lg border border-border text-center">
          <p className="text-sm text-muted-foreground">
            💡 Tip: Different strategies work better depending on your priorities.
            Try switching between routes to see which gives you the best coverage!
          </p>
        </div>
      </div>
    </main>
  )
}
