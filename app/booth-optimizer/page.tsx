'use client'

import { useEffect, useState } from 'react'
import { StrategyToggle } from '@/components/strategy-toggle'
import { BoothList } from '@/components/booth-list'
import { ExpoFPWayfinding } from '@/components/expofp-wayfinding'
import { useRouteCalculator } from '@/hooks/use-route-calculator'
import { getMockBooths } from '@/lib/booth-data'
import { Booth } from '@/lib/distance-utils'

export default function BoothOptimizerPage() {
  const [booths, setBooths] = useState<Booth[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [waypointIds, setWaypointIds] = useState<string[]>([])
  const [showInfo, setShowInfo] = useState(false)

  const { strategy, route, calculateRoute, initializeRoute } = useRouteCalculator({ booths })

  useEffect(() => {
    const fetchBooths = async () => {
      try {
        const response = await fetch('https://team26.expofp.com/data/booths.json')
        if (!response.ok) throw new Error('Failed to fetch')
        
        const data = await response.json()
        const boothList: Booth[] = []
        
        for (const level of data.booths) {
          for (const booth of level.booths) {
            const id = booth.id.trim()
            
            if (id === 'Registration') {
              boothList.push({
                id,
                name: 'Event Check-In',
                vendor: 'Registration',
                x: (booth.rect[0] + booth.rect[2]) / 2,
                y: (booth.rect[1] + booth.rect[5]) / 2,
                size: 'large',
                externalId: id,
              })
              continue
            }
            
            if (!/^\d+$/.test(id)) continue
            
            const rect = booth.rect
            const x = (rect[0] + rect[2]) / 2
            const y = (rect[1] + rect[5]) / 2
            const width = Math.abs(rect[2] - rect[0])
            const height = Math.abs(rect[5] - rect[1])
            const area = width * height
            
            let size: 'small' | 'medium' | 'large' = 'medium'
            if (area > 2000) size = 'large'
            else if (area > 500) size = 'medium'
            else size = 'small'
            
            boothList.push({
              id,
              name: `Booth ${id}`,
              vendor: '',
              x,
              y,
              size,
              externalId: id,
            })
          }
        }
        
        setBooths(boothList)
      } catch (error) {
        console.error('[v0] Failed to fetch booths:', error)
        setBooths(getMockBooths())
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooths()
  }, [])

  useEffect(() => {
    if (booths.length > 0) {
      initializeRoute()
    }
  }, [booths, initializeRoute])

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
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Team '26 Booth Optimizer
            </h1>
            <p className="text-muted-foreground">
              Find the most efficient route through all booths. Select a strategy and see your optimized path.
            </p>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-card border border-border hover:bg-card/80 flex items-center justify-center text-foreground hover:text-primary transition-colors"
            aria-label="Information"
            title="Learn about data sources and APIs"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Info Modal */}
        {showInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
              <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">How It Works</h2>
                <button
                  onClick={() => setShowInfo(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-6 space-y-6">
                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Data Sources</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-foreground">ExpoFP Booth API</p>
                      <p className="text-sm text-muted-foreground">
                        We fetch real-time booth locations, dimensions, and layout data from your ExpoFP event floor plan. This gives us accurate coordinates for distance calculations and wayfinding.
                      </p>
                      <code className="text-xs bg-background p-1 rounded mt-1 block">
                        https://team26.expofp.com/data/booths.json
                      </code>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Atlassian Marketplace API</p>
                      <p className="text-sm text-muted-foreground">
                        Ready to integrate vendor names, logos, and app details. The API returns company information by booth ID, enriching your route with vendor context.
                      </p>
                      <code className="text-xs bg-background p-1 rounded mt-1 block">
                        REST API v3 • Marketplace app-listing endpoints
                      </code>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Wayfinding Technology</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    We use ExpoFP's Wayfinding API to render interactive routes with animated flowing lines directly on your floor plan.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex gap-2">
                      <span className="font-medium text-foreground flex-shrink-0">selectRoute():</span>
                      <span>Calculates optimal path between selected POIs and renders visualization</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-medium text-foreground flex-shrink-0">Live Updates:</span>
                      <span>Route recomputes instantly when you switch optimization strategies</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Route Optimization</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Three strategies for navigating the show:
                  </p>
                  <ul className="text-sm space-y-2">
                    <li className="flex gap-2">
                      <span className="font-medium text-foreground flex-shrink-0">Serpentine:</span>
                      <span className="text-muted-foreground">Systematic row-by-row sweep (left→right, then right→left)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-medium text-foreground flex-shrink-0">Big to Small:</span>
                      <span className="text-muted-foreground">Large booths first for maximum swag, then smaller ones</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-medium text-foreground flex-shrink-0">Quest Mode:</span>
                      <span className="text-muted-foreground">Curated path from Atlassian • Complete for Team t-shirt (coming soon)</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-3">For Developers</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Want to build this yourself? Check out our documentation:
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>
                      <code className="text-xs bg-background p-1 rounded">docs/ARCHITECTURE.md</code> - System design and data flow
                    </li>
                    <li>
                      <code className="text-xs bg-background p-1 rounded">docs/DEVELOPMENT.md</code> - Implementation guide
                    </li>
                    <li>
                      <a href="https://developer.expofp.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        ExpoFP Developer Docs
                      </a>
                    </li>
                    <li>
                      <a href="https://developer.atlassian.com/platform/marketplace" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Atlassian Marketplace API
                      </a>
                    </li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2" />
              <p className="text-sm text-muted-foreground">Loading booths...</p>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Interactive Floor Plan</h2>
              <ExpoFPWayfinding waypointIds={waypointIds} autoRoute={true} />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <StrategyToggle activeStrategy={strategy} onStrategyChange={handleStrategyChange} />

                <div className="p-4 bg-card rounded-lg border border-border">
                  <h3 className="font-semibold text-foreground mb-2">
                    {strategy === 'serpentine' ? 'Serpentine Route' : strategy === 'big-to-small' ? 'Big to Small' : 'Quest Mode'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {strategy === 'serpentine' ? 'Systematic row-by-row sweep.' : strategy === 'big-to-small' ? 'Visit larger booths first for maximum swag.' : 'Complete the quest for a Team t-shirt (coming soon).'}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Total Booths</span>
                      <span className="font-bold text-foreground">{route?.totalBooths || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <h2 className="text-lg font-semibold text-foreground mb-4">Booth Sequence</h2>
                <BoothList route={route} />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
