'use client'

import { RouteResult } from '@/lib/distance-utils'
import { getExhibitorLogo } from '@/lib/exhibitor-metadata'
import Image from 'next/image'

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
      <div className="p-4 bg-card rounded-lg border border-border">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">
            {route.totalBooths}
          </div>
          <div className="text-sm text-muted-foreground mt-2">Booths in Route</div>
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
                  <div className="font-semibold text-foreground">
                    Booth {stop.booth.id}
                  </div>
                  {stop.booth.vendor ? (
                    <>
                      {/* Logo and vendor name */}
                      <div className="flex items-center gap-2 mt-2">
                        {getExhibitorLogo(stop.booth.vendor) && (
                          <div className="flex-shrink-0 w-10 h-10 rounded border border-border overflow-hidden bg-background">
                            <Image
                              src={`https://team26.expofp.com/${getExhibitorLogo(stop.booth.vendor)}`}
                              alt={stop.booth.vendor}
                              width={40}
                              height={40}
                              className="w-full h-full object-contain p-0.5"
                            />
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground font-medium">
                          {stop.booth.vendor}
                        </div>
                      </div>
                      {/* Description */}
                      {stop.booth.description && (
                        <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {stop.booth.description}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      Vendor details coming soon
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
