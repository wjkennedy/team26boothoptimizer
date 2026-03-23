'use client'

import { useEffect, useState } from 'react'
import { StrategyToggle } from '@/components/strategy-toggle'
import { BoothList } from '@/components/booth-list'
import { ExpoFPWayfinding } from '@/components/expofp-wayfinding'
import { useRouteCalculator } from '@/hooks/use-route-calculator'
import { getBoothsFromExpoFP } from '@/lib/booth-data'
import { Booth } from '@/lib/distance-utils'

export default function BoothOptimizerPage() {
  const [booths, setBooths] = useState<Booth[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [waypointIds, setWaypointIds] = useState<string[]>([])

  const { strategy, route, calculateRoute, initializeRoute } =
    useRouteCalculator({ booths })

  // Fetch booths from ExpoFP API
  useEffect(() => {
    const fetchBooths = async () => {
      try {
        const boothData = await getBoothsFromExpoFP()
        console.log('[v0] Fetched', boothData.length, 'booths')
        setBooths(boothData)
      } catch (error) {
        console.error('[v0] Failed to fetch booths:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooths()
  }, [])

  // Initialize route when booths are loaded
  useEffect(() => {
    if (booths.length > 0) {
      initializeRoute()
    }
  }, [booths, initializeRoute])

  // Update waypointIds when route changes
  useEffect(() => {
    if (route && route.route) {
      const ids = route.route.map((stop) => stop.booth.externalId || stop.booth.id)
      setWaypointIds(ids)
    }
  }, [route])

  const handleStrategyChange = (newStrategy: 'serpentine' | 'big-to-small' | 'quest') => {
    calculateRoute(newStrategy)
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Team '26 Booth Optimizer
          </h1>
          <p className="text-muted-foreground">
            Find the most efficient route through all booths. Select a strategy
            and see your optimized path visualized on the floor plan.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2" />
              <p className="text-sm text-muted-foreground">
                Loading booths and floor plan...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Floor Plan */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Interactive Floor Plan
              </h2>
              <ExpoFPWayfinding waypointIds={waypointIds} autoRoute={true} />
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left: Strategy Selection */}
              <div className="lg:col-span-1 space-y-6">
                <StrategyToggle
                  activeStrategy={strategy}
                  onStrategyChange={handleStrategyChange}
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
                  <p className="text-sm text-muted-foreground mb-4">
                    {strategy === 'serpentine'
                      ? 'Systematically sweeps through each row of booths left to right, then right to left. Minimizes backtracking for steady coverage.'
                      : strategy === 'big-to-small'
                        ? 'Prioritizes larger booths first for maximum swag potential, then fills in the gaps with smaller booths using an optimized path.'
                        : 'Follows Atlassian\'s curated quest sequence for strategic booth coverage.'}
                  </p>

                  {/* Efficiency Stats */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Total Booths
                      </span>
                      <span className="font-bold text-foreground">
                        {route?.totalBooths || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Distance
                      </span>
                      <span className="font-bold text-foreground">
                        {route?.totalDistance ? route.totalDistance.toFixed(0) : '0'} m
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Efficiency
                      </span>
                      <span className="font-bold text-accent">
                        {route?.efficiency ? route.efficiency.toFixed(3) : '0'} booths/m
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Booth List */}
              <div className="lg:col-span-2">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Booth Sequence
                </h2>
                <BoothList route={route} />
              </div>
            </div>

            {/* Footer Info */}
            <div className="p-6 bg-card rounded-lg border border-border text-center">
              <p className="text-sm text-muted-foreground">
                💡 Tip: Try switching between strategies to compare efficiency
                and coverage. Quest Mode follows Atlassian's recommended path.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
