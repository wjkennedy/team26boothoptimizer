'use client'

import { useEffect, useRef, useState } from 'react'

interface ExpoFPWayfindingProps {
  waypointIds?: string[]
  autoRoute?: boolean
}

export function ExpoFPWayfinding({
  waypointIds = [],
  autoRoute = true,
}: ExpoFPWayfindingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const floorPlanRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load ExpoFP script and initialize wayfinding
  useEffect(() => {
    if (!containerRef.current) return

    // Check if ExpoFP already loaded
    if ((window as any).ExpoFP) {
      setIsReady(true)
      initializeFloorPlan()
    } else {
      // Load ExpoFP script
      const script = document.createElement('script')
      script.src = 'https://www.expofp.com/build/expofp-js-api.js'
      script.async = true
      script.onload = () => {
        console.log('[v0] ExpoFP script loaded')
        setIsReady(true)
        setError(null)
        initializeFloorPlan()
      }
      script.onerror = () => {
        console.error('[v0] Failed to load ExpoFP script')
        setError('Unable to load floor plan. Please check your connection.')
        setIsReady(false)
      }
      document.body.appendChild(script)
    }

    return () => {
      // Cleanup if needed
    }
  }, [])

  const initializeFloorPlan = () => {
    if (!containerRef.current) return
    if (!(window as any).ExpoFP) return

    try {
      console.log('[v0] Initializing ExpoFP FloorPlan for Team 26')

      const floorPlan = new (window as any).ExpoFP.FloorPlan({
        element: containerRef.current,
        eventId: 'team26',
      })

      floorPlanRef.current = floorPlan
      ;(window as any).__team26FloorPlan = floorPlan

      // Initialize route if waypointIds provided
      if (waypointIds.length > 0) {
        setupRoute(floorPlan, waypointIds)
      }
    } catch (error) {
      console.error('[v0] Failed to initialize ExpoFP:', error)
      setError('Failed to initialize floor plan. Visit ExpoFP site directly.')
    }
  }

  const setupRoute = (floorPlan: any, ids: string[]) => {
    try {
      if (!ids || ids.length === 0) return

      console.log('[v0] Setting up ExpoFP route with', ids.length, 'waypoints')

      // ExpoFP selectRoute expects array of POI IDs
      // It will automatically calculate the optimal route with flowing lines
      floorPlan.selectRoute(ids.slice(0, 10))
    } catch (error) {
      console.error('[v0] Error setting up route:', error)
    }
  }

  // Update route when waypointIds change
  useEffect(() => {
    if (floorPlanRef.current && waypointIds.length > 0) {
      setupRoute(floorPlanRef.current, waypointIds)
    }
  }, [waypointIds])

  return (
    <div className="w-full space-y-4">
      <div
        ref={containerRef}
        className="w-full h-[600px] rounded-lg border border-border overflow-hidden bg-card"
        style={{ minHeight: '600px' }}
      />
      <div className="text-xs text-muted-foreground text-center p-2">
        {error ? (
          <div className="text-destructive">
            <p>{error}</p>
            <p className="text-xs mt-1">
              Embed at{' '}
              <code className="bg-background px-1">team26.expofp.com/wayfinding</code>
            </p>
          </div>
        ) : (
          <>
            <p>
              {waypointIds.length > 0
                ? `Optimized route for ${waypointIds.length} booths`
                : 'Interactive floor plan with wayfinding'}
            </p>
            {!isReady && (
              <p className="text-xs mt-1">Loading floor plan...</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

declare global {
  interface Window {
    ExpoFP?: any
    __team26FloorPlan?: any
  }
}
