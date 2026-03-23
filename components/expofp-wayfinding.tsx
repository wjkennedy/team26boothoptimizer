'use client'

import { useEffect, useRef, useState } from 'react'

interface ExpoFPWayfindingProps {
  waypointIds?: string[] // Booth IDs to create a route through
  autoRoute?: boolean // Auto-calculate optimized route
}

export function ExpoFPWayfinding({
  waypointIds = [],
  autoRoute = true,
}: ExpoFPWayfindingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const floorPlanRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load ExpoFP script
    if (!window.ExpoFP) {
      const script = document.createElement('script')
      script.src = 'https://www.expofp.com/build/expofp-js-api.js'
      script.async = true
      script.onload = () => {
        initializeFloorPlan()
      }
      document.body.appendChild(script)
    } else {
      initializeFloorPlan()
    }
  }, [])

  const initializeFloorPlan = () => {
    if (!containerRef.current || !window.ExpoFP) return

    try {
      // Initialize ExpoFP FloorPlan for Team 26
      const floorPlan = new window.ExpoFP.FloorPlan({
        element: containerRef.current,
        eventId: 'team26',
        dataUrl: 'https://team26.expofp.com/api/v1/event',
        onInit: (fp: any) => {
          console.log('[v0] ExpoFP FloorPlan initialized')
          floorPlanRef.current = fp
          setIsLoaded(true)

          // Store reference for booth data extraction
          ;(window as any).__team26FloorPlan = fp

          // If waypointIds provided, set up route
          if (waypointIds.length > 0 && autoRoute) {
            setupRoute(fp, waypointIds)
          }
        },
        onBoothClick: (e: any) => {
          console.log('[v0] Booth clicked:', e.target.name)
        },
        onDirection: (e: any) => {
          console.log('[v0] Route calculated:', {
            from: e.from.name,
            to: e.to.name,
            distance: e.distance,
            time: e.time,
          })
        },
      })
    } catch (error) {
      console.error('[v0] Failed to initialize ExpoFP:', error)
    }
  }

  const setupRoute = (fp: any, waypointIds: string[]) => {
    if (waypointIds.length === 0) return

    try {
      // Convert booth IDs to waypoints for ExpoFP
      const waypoints = waypointIds
        .slice(0, 8) // ExpoFP max 8 waypoints (10 total with start/end)
        .map((id) => ({
          externalId: id,
        }))

      if (waypoints.length > 0) {
        // Select route from first to last with intermediate waypoints
        fp.selectRoute(waypoints)
      }
    } catch (error) {
      console.error('[v0] Failed to set up route:', error)
    }
  }

  return (
    <div className="w-full space-y-4">
      <div
        ref={containerRef}
        className="w-full h-[600px] rounded-lg border border-border overflow-hidden bg-card"
        style={{ minHeight: '600px' }}
      />
      {!isLoaded && (
        <div className="flex items-center justify-center h-[600px] bg-muted rounded-lg">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2" />
            <p className="text-sm text-muted-foreground">
              Loading floor plan...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

declare global {
  interface Window {
    ExpoFP?: any
  }
}
