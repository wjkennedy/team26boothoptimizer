'use client'

import { useEffect, useState } from 'react'
import { StrategyToggle } from '@/components/strategy-toggle'
import { BoothList } from '@/components/booth-list'
import { ExpoFPWayfinding } from '@/components/expofp-wayfinding'
import { useRouteCalculator } from '@/hooks/use-route-calculator'
import { getMockBooths } from '@/lib/booth-data'
import { Booth } from '@/lib/distance-utils'
import { MarketplaceBrowser } from '@/components/marketplace-browser'
import { boothVendorMap } from '@/lib/booth-vendor-map'
import { getExhibitorDescription } from '@/lib/exhibitor-metadata'

type ActiveTab = 'route' | 'vendors'

export default function BoothOptimizerPage() {
  const [booths, setBooths] = useState<Booth[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [waypointIds, setWaypointIds] = useState<string[]>([])
  const [showInfo, setShowInfo] = useState(false)
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null)
  const [offlineUrl, setOfflineUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('route')
  const [hideUnlabeled, setHideUnlabeled] = useState(false)

  const { strategy, route, calculateRoute, initializeRoute } = useRouteCalculator({ booths: hideUnlabeled ? booths.filter(b => b.vendor) : booths })

  useEffect(() => {
    // Recalculate route when hideUnlabeled changes
    if (booths.length > 0) {
      const filteredBooths = hideUnlabeled ? booths.filter(b => b.vendor) : booths
      calculateRoute(strategy, filteredBooths)
    }
  }, [hideUnlabeled, strategy, booths, calculateRoute])

  useEffect(() => {
    // Fetch offline archive URL so users can download the full floor plan for offline use
    fetch('https://app.expofp.com/api/v2/expo-offline/team26/get/latest')
      .then(r => r.json())
      .then(data => {
        if (data?.fileUrl) setOfflineUrl(data.fileUrl)
      })
      .catch(() => {/* offline API is optional */})
  }, [])

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
              vendor: boothVendorMap[id] ?? '',
              description: boothVendorMap[id] ? getExhibitorDescription(boothVendorMap[id]) : undefined,
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
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
              Team '26 Booth Optimizer
            </h1>
            <p className="text-muted-foreground text-sm">
              Find the most efficient route through all booths, or browse vendors by app.
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

        {/* Tab bar */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit mb-6">
          {([
            { id: 'route', label: 'Route Optimizer' },
            { id: 'vendors', label: 'Browse Vendors' },
          ] as { id: ActiveTab; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
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

              <div className="px-6 py-6 space-y-6 text-sm">

                {/* Data Sources */}
                <section>
                  <h3 className="text-base font-semibold text-foreground mb-3">Data Sources</h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-background rounded-lg border border-border">
                      <p className="font-medium text-foreground mb-1">ExpoFP Public Data API</p>
                      <p className="text-muted-foreground mb-2">
                        Booth coordinates, dimensions, and layout are fetched from the Team 26 event's public JSON endpoint. Each booth rect is an 8-value polygon; we derive the center and area to classify size.
                      </p>
                      <code className="text-xs block bg-card px-2 py-1 rounded border border-border">
                        GET https://team26.expofp.com/data/booths.json
                      </code>
                    </div>
                    <div className="p-3 bg-background rounded-lg border border-border">
                      <p className="font-medium text-foreground mb-1">Atlassian Marketplace REST API v3</p>
                      <p className="text-muted-foreground mb-2">
                        Vendor names, app summaries, and logos will be joined to booth data by product or developer ID. The integration is wired and ready — we need the booth-to-product mapping to activate it.
                      </p>
                      <code className="text-xs block bg-card px-2 py-1 rounded border border-border">
                        GET /marketplace/rest/3/product-listing/developer-space/{'{developerId}'}
                      </code>
                    </div>
                  </div>
                </section>

                {/* ExpoFP JS SDK */}
                <section>
                  <h3 className="text-base font-semibold text-foreground mb-3">ExpoFP JavaScript SDK</h3>
                  <p className="text-muted-foreground mb-3">
                    The SDK is embedded from the event domain and initialized with <code className="bg-background px-1 rounded">new ExpoFP.FloorPlan()</code>. The following methods are available for our use case:
                  </p>
                  <div className="space-y-2">
                    {[
                      { method: 'selectRoute(waypoints[])', status: 'ready', note: 'Renders the animated route on the real floor plan. Max 10 waypoints.' },
                      { method: 'getOptimizedRoutes(waypoints[])', status: 'opportunity', note: 'ExpoFP\'s own TSP-style optimizer — could replace our manual strategies.' },
                      { method: 'boothsList() / exhibitorsList()', status: 'opportunity', note: 'Pull richer exhibitor data directly from the SDK after init.' },
                      { method: 'highlightBooths(ids[])', status: 'opportunity', note: 'Highlight route booths on the live map for visual context.' },
                      { method: 'setBookmarks(booths[])', status: 'opportunity', note: 'Persist bookmarked booths — useful for the Quest stamp card.' },
                      { method: 'setVisibility({})', status: 'ready', note: 'Hide SDK chrome (header, controls, overlay) for embedded use.' },
                      { method: 'onBoothClick(e)', status: 'opportunity', note: 'Interactive selection — tap a booth to add it to your route.' },
                      { method: 'zoomTo(selectors, options)', status: 'opportunity', note: 'Auto-zoom to the current route for focused navigation.' },
                      { method: 'findLocation() / blue-dot', status: 'opportunity', note: 'GPS blue-dot with route snapping within 7.5m, auto-reroutes at 10+ units.' },
                    ].map(({ method, status, note }) => (
                      <div key={method} className="flex gap-3 items-start">
                        <span className={`flex-shrink-0 mt-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${
                          status === 'ready'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {status === 'ready' ? 'in use' : 'next'}
                        </span>
                        <div>
                          <code className="text-xs text-foreground">{method}</code>
                          <p className="text-xs text-muted-foreground mt-0.5">{note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Route strategies */}
                <section>
                  <h3 className="text-base font-semibold text-foreground mb-3">Route Strategies</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-background rounded-lg border border-border">
                      <p className="font-medium text-foreground">Serpentine</p>
                      <p className="text-muted-foreground">Row-by-row sweep alternating left-right direction. Minimises backtracking across the whole floor.</p>
                    </div>
                    <div className="p-3 bg-background rounded-lg border border-border">
                      <p className="font-medium text-foreground">Big to Small</p>
                      <p className="text-muted-foreground">Prioritises larger booths first, then fills in smaller ones. Good for maximising high-value stops early.</p>
                    </div>
                    <div className="p-3 bg-background rounded-lg border border-border opacity-60">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground">Quest Mode</p>
                        <span className="text-xs bg-card border border-border px-1.5 py-0.5 rounded text-muted-foreground">coming soon</span>
                      </div>
                      <p className="text-muted-foreground">A curated sequence of booths designated by Atlassian. Complete the full list to claim a Team t-shirt at the Atlassian booth.</p>
                    </div>
                  </div>
                </section>

                {/* Other APIs available */}
                <section>
                  <h3 className="text-base font-semibold text-foreground mb-3">Other ExpoFP APIs Available</h3>
                  <div className="space-y-1 text-muted-foreground">
                    <p><span className="font-medium text-foreground">Bookmarks URL params</span> — <code className="bg-background px-1 rounded text-xs">?b=exhibitorId</code> pre-bookmarks exhibitors on load.</p>
                    <p><span className="font-medium text-foreground">Webhooks</span> — ExpoFP can POST to your server on booth_reserved, exhibitor_upserted, etc.</p>
                    <p><span className="font-medium text-foreground">Offline API</span> — versioned ZIP archives for fully offline kiosk use at <code className="bg-background px-1 rounded text-xs">app.expofp.com/api/v2/expo-offline/{'{expoKey}'}/get-or-create/latest</code>.</p>
                    <p><span className="font-medium text-foreground">Kiosk mode</span> — set up a physical kiosk using <code className="bg-background px-1 rounded text-xs">?setkiosk</code> in the map URL, with bearing/zoom/position controls.</p>
                  </div>
                </section>

                {/* Dev links */}
                <section className="border-t border-border pt-4">
                  <h3 className="text-base font-semibold text-foreground mb-2">References</h3>
                  <ul className="space-y-1">
                    <li><a href="https://developer.expofp.com/guide/java-script-api-reference" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ExpoFP JS API Reference</a></li>
                    <li><a href="https://developer.expofp.com/guide/wayfinding-guide" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ExpoFP Wayfinding Guide</a></li>
                    <li><a href="https://developer.expofp.com/guide/query-parameters" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ExpoFP Query Parameters</a></li>
                    <li><a href="https://developer.atlassian.com/platform/marketplace/rest/v4/api-group-app-listing/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Atlassian Marketplace REST API</a></li>
                    <li className="text-muted-foreground"><code className="bg-background px-1 rounded text-xs">docs/ARCHITECTURE.md</code> and <code className="bg-background px-1 rounded text-xs">docs/DEVELOPMENT.md</code> in this repo</li>
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
        ) : activeTab === 'vendors' ? (
          <MarketplaceBrowser
            booths={booths}
            waypointIds={waypointIds}
            onAddBooth={(boothId) => {
              if (!waypointIds.includes(boothId)) {
                setWaypointIds(prev => [...prev, boothId])
              }
            }}
          />
        ) : (
          <>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Interactive Floor Plan</h2>
              <ExpoFPWayfinding
                booths={booths}
                waypointIds={waypointIds}
                onBoothClick={(booth) => setSelectedBooth(booth)}
              />

              {/* Booth detail popover */}
              {selectedBooth && (
                <div className="mt-3 p-4 bg-card border border-border rounded-lg flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-foreground">Booth {selectedBooth.id}</div>
                    {selectedBooth.vendor ? (
                      <div className="text-sm text-muted-foreground">{selectedBooth.vendor}</div>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">Vendor details coming soon — will be joined from Atlassian Marketplace API</div>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        selectedBooth.size === 'large' ? 'bg-primary/20 text-primary'
                        : selectedBooth.size === 'medium' ? 'bg-secondary/20 text-secondary'
                        : 'bg-muted text-muted-foreground'
                      }`}>{selectedBooth.size}</span>
                      <span className="text-xs text-muted-foreground">
                        Stop #{waypointIds.indexOf(selectedBooth.id) >= 0 ? waypointIds.indexOf(selectedBooth.id) + 1 : 'not in route'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedBooth(null)}
                    className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Dismiss"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <StrategyToggle activeStrategy={strategy} onStrategyChange={handleStrategyChange} />

                {/* Unlabeled booths toggle */}
                <div className="p-4 bg-card rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground text-sm">Booth Filtering</h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideUnlabeled}
                      onChange={(e) => setHideUnlabeled(e.target.checked)}
                      className="w-4 h-4 rounded border border-border"
                    />
                    <span className="text-sm text-muted-foreground">
                      Hide unlabeled booths
                    </span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Unlabeled booths are likely conjoined with other vendors or unused.
                  </p>
                </div>

                <div className="p-4 bg-card rounded-lg border border-border">
                  <h3 className="font-semibold text-foreground mb-2">
                    {strategy === 'serpentine' ? 'Serpentine Route'
                      : strategy === 'big-to-small' ? 'Big to Small'
                      : strategy === 'expofp' ? 'ExpoFP Optimized'
                      : 'Quest Mode'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {strategy === 'serpentine' ? 'Systematic row-by-row sweep.'
                      : strategy === 'big-to-small' ? 'Visit larger booths first for maximum swag.'
                      : strategy === 'expofp' ? 'TSP heuristic matching ExpoFP\'s getOptimizedRoutes() — tries every start point and picks the shortest path.'
                      : 'Complete the quest for a Team t-shirt (coming soon).'}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Total Booths</span>
                      <span className="font-bold text-foreground">{route?.totalBooths || 0} {hideUnlabeled && booths.length > 0 ? `/ ${booths.length}` : ''}</span>
                    </div>
                    {hideUnlabeled && booths.length > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Unlabeled hidden</span>
                        <span className="text-xs text-muted-foreground">{booths.filter(b => !b.vendor).length} booths</span>
                      </div>
                    )}
                    {offlineUrl && (
                      <div className="pt-2 border-t border-border">
                        <a
                          href={offlineUrl}
                          download
                          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download floor plan (offline)
                        </a>
                      </div>
                    )}
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
