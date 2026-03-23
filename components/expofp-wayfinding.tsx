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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load ExpoFP script
    if (!(window as any).ExpoFP) {
      const script = document.createElement('script')
      script.src = 'https://www.expofp.com/build/expofp-js-api.js'
      script.async = true
      script.onload = () => {
        console.log('[v0] ExpoFP script loaded')
        initializeFloorPlan()
      }
      script.onerror = () => {
        console.error('[v0] Failed to load ExpoFP script')
        setError('Failed to load floor plan library')
      }
      document.body.appendChild(script)
    } else {
      initializeFloorPlan()
    }
  }, [])

  const initializeFloorPlan = async () => {
    if (!containerRef.current) {
      console.log('[v0] Container ref not ready')
      return
    }

    if (!(window as any).ExpoFP) {
      console.error('[v0] ExpoFP not available on window')
      setError('ExpoFP library not available')
      return
    }

    try {
      console.log('[v0] Initializing ExpoFP FloorPlan...')
      
      // Initialize ExpoFP FloorPlan for Team 26
      const floorPlan = new (window as any).ExpoFP.FloorPlan({
        element: containerRef.current,
        eventId: 'team26',
        dataUrl: 'https://team26.expofp.com/data/event.json',
        onInit: (fp: any) => {
          console.log('[v0] ExpoFP FloorPlan onInit callback fired')
          floorPlanRef.current = fp
          
          // Store reference for booth data extraction
          ;(window as any).__team26FloorPlan = fp

          // If waypointIds provided, set up route
          if (waypointIds.length > 0 && autoRoute) {
            console.log('[v0] Setting up route with', waypointIds.length, 'waypoints')
            setupRoute(fp, waypointIds)
          }
          
          setIsLoaded(true)
        },
        onBoothClick: (e: any) => {
          console.log('[v0] Booth clicked:', e.target.name)
        },
        onDirection: (e: any) => {
          console.log('[v0] Route calculated:', {
            from: e.from.name,
            to: e.to.name,
            distance: e.distance,
          })
        },
      })

      // Also wait for the ready promise as a backup
      console.log('[v0] Waiting for FloorPlan ready promise...')
      await floorPlan.ready
      console.log('[v0] FloorPlan ready promise resolved')
      
    } catch (error) {
      console.error('[v0] Failed to initialize ExpoFP:', error)
      setError(error instanceof Error ? error.message : 'Failed to initialize floor plan')
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
        console.log('[v0] Selecting route through waypoints:', waypoints)
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
      {!isLoaded && !error && (
        <div className="flex items-center justify-center h-[600px] bg-muted rounded-lg">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2" />
            <p className="text-sm text-muted-foreground">
              Loading floor plan...
            </p>
          </div>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center h-[600px] bg-destructive/10 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-destructive font-medium mb-2">Error loading floor plan</p>
            <p className="text-xs text-destructive/70">{error}</p>
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
