'use client'

import { useMemo } from 'react'

interface ExpoFPWayfindingProps {
  waypointIds?: string[] // Booth IDs to create a route through
  autoRoute?: boolean // Auto-calculate optimized route
}

export function ExpoFPWayfinding({
  waypointIds = [],
  autoRoute = true,
}: ExpoFPWayfindingProps) {
  // Build wayfinding URL with route parameters
  const wayfindingUrl = useMemo(() => {
    const baseUrl = 'https://team26.expofp.com/wayfinding'
    
    if (!waypointIds || waypointIds.length === 0) {
      return baseUrl
    }

    // ExpoFP wayfinding format: ?route=id1:id2:id3...
    // or use the format from the example: ?route%3A101-12%3A42-23%3Afalse
    const routeParam = waypointIds.slice(0, 10).join('-')
    return `${baseUrl}?route=${encodeURIComponent(routeParam)}`
  }, [waypointIds])

  return (
    <div className="w-full space-y-4">
      <div className="w-full h-[600px] rounded-lg border border-border overflow-hidden bg-card">
        <iframe
          src={wayfindingUrl}
          className="w-full h-full border-0"
          title="Team 26 Floor Plan"
          allow="fullscreen"
          style={{ display: 'block' }}
        />
      </div>
      <div className="text-xs text-muted-foreground text-center p-2">
        <p>
          {waypointIds.length > 0
            ? `Route showing ${waypointIds.length} booths`
            : 'Interactive floor plan'}
        </p>
      </div>
    </div>
  )
}
