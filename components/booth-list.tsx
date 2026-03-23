'use client'

import { RouteResult } from '@/lib/distance-utils'

interface BoothListProps {
  route: RouteResult | null
  isLoading?: boolean
}

export function BoothList({ route, isLoading = false }: BoothListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (!route || route.route.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No route available. Adjust filters or try another strategy.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-card rounded-lg border border-border">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {route.totalBooths}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Booths</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-secondary">
            {route.totalDistance}m
          </div>
          <div className="text-xs text-muted-foreground mt-1">Total Distance</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent">
            {route.efficiency}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Booths per Meter
          </div>
        </div>
      </div>

      {/* Ordered Booth List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Visit Order</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {route.route.map((stop) => (
            <div
              key={`${stop.booth.id}-${stop.position}`}
              className="p-3 bg-card border border-border rounded-lg hover:bg-card/80 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {stop.position}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground truncate">
                    {stop.booth.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stop.booth.vendor}
                  </div>
                  {stop.distanceFromPrevious > 0 && (
                    <div className="text-xs text-accent mt-1">
                      +{stop.distanceFromPrevious.toFixed(1)}m from previous
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                      stop.booth.size === 'large'
                        ? 'bg-primary/20 text-primary'
                        : stop.booth.size === 'medium'
                          ? 'bg-secondary/20 text-secondary'
                          : 'bg-accent/20 text-accent'
                    }`}
                  >
                    {stop.booth.size}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
