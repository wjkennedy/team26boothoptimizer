'use client'

import { useState, useEffect } from 'react'
import { Booth } from '@/lib/distance-utils'
import { fetchAllMarketplaceApps } from '@/lib/marketplace-api'
import type { MarketplaceApp } from '@/lib/marketplace-types'

interface MarketplaceBrowserProps {
  booths: Booth[]
  waypointIds: string[]
  onAddBooth?: (boothId: string) => void
}

export function MarketplaceBrowser({
  booths,
  waypointIds,
  onAddBooth,
}: MarketplaceBrowserProps) {
  const [allApps, setAllApps] = useState<MarketplaceApp[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Prefetch all marketplace apps on mount
  useEffect(() => {
    const loadApps = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const apps = await fetchAllMarketplaceApps({ hosting: 'cloud' }, 5000)
        setAllApps(apps)
      } catch (e) {
        console.error('[v0] Error loading marketplace:', e)
        setError('Failed to load marketplace data')
      } finally {
        setIsLoading(false)
      }
    }
    loadApps()
  }, [])

  // Extract unique categories and vendors
  const categories = Array.from(
    new Set(
      allApps.flatMap(app => app._embedded?.categories?.map(c => c.name) || [])
    )
  ).sort()

  const vendors = Array.from(
    new Set(allApps.map(app => app._embedded?.vendor?.name).filter(Boolean))
  ).sort()

  // Filter apps based on selections
  const filteredApps = allApps.filter(app => {
    if (selectedCategory) {
      const appCategories = app._embedded?.categories?.map(c => c.name) || []
      if (!appCategories.includes(selectedCategory)) return false
    }
    if (selectedVendor) {
      if (app._embedded?.vendor?.name !== selectedVendor) return false
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        app.name.toLowerCase().includes(q) ||
        app._embedded?.vendor?.name?.toLowerCase().includes(q) ||
        app.summary?.toLowerCase().includes(q)
      )
    }
    return true
  })

  // Find booth matches
  const findBoothForApp = (app: MarketplaceApp): Booth | undefined => {
    const vendorName = app._embedded?.vendor?.name ?? ''
    const appName = app.name ?? ''
    return booths.find(b => {
      if (!b.vendor) return false
      const bv = b.vendor.toLowerCase()
      return bv.includes(vendorName.toLowerCase()) ||
        vendorName.toLowerCase().includes(bv) ||
        bv.includes(appName.toLowerCase())
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Browse Marketplace Vendors</h2>
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Loading' : 'Select'} vendors by category, filter by name, and add to your route.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading marketplace data...</p>
            <p className="text-xs text-muted-foreground/60 mt-1">This fetches live data from the Atlassian Marketplace (may take 10-20 seconds)</p>
          </div>
        </div>
      ) : (
        <>
          {/* Category filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Category</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                  selectedCategory === null
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === cat ? null : cat)
                    setSelectedVendor(null)
                  }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Vendor filter (if category selected) */}
          {selectedCategory && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Vendor in {selectedCategory}</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedVendor(null)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                    selectedVendor === null
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  All
                </button>
                {vendors
                  .filter(v => {
                    const vendorApps = filteredApps.filter(
                      app => app._embedded?.vendor?.name === v
                    )
                    return vendorApps.length > 0
                  })
                  .map(vendor => (
                    <button
                      key={vendor}
                      onClick={() => setSelectedVendor(selectedVendor === vendor ? null : vendor)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                        selectedVendor === vendor
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {vendor}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Search within filtered apps */}
          {filteredApps.length > 0 && (
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium text-foreground">
                Search
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  id="search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by app or vendor name..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* Results */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {filteredApps.length} result{filteredApps.length !== 1 ? 's' : ''}
            </p>
            {filteredApps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No apps match your selection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredApps.map(app => {
                  const matchedBooth = findBoothForApp(app)
                  const inRoute = matchedBooth ? waypointIds.includes(matchedBooth.id) : false
                  const vendorName = app._embedded?.vendor?.name ?? ''
                  const rating = app._embedded?.distribution?.averageRating
                  const installs = app._embedded?.distribution?.totalInstalls
                  const isVerified = app._embedded?.vendor?.verifiedStatus === 'verified'
                  const isAtlassian = app._embedded?.vendor?.isAtlassian ?? false
                  const marketplaceUrl = `https://marketplace.atlassian.com/apps/${app.key}`

                  return (
                    <div
                      key={app.key}
                      className="p-3 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors flex flex-col gap-2"
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-md bg-muted flex items-center justify-center text-xl select-none">
                          🧩
                        </div>

                        {/* Name + vendor */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-1 flex-wrap">
                            <a
                              href={marketplaceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-sm text-foreground hover:text-primary transition-colors leading-tight"
                            >
                              {app.name}
                            </a>
                            {isAtlassian && (
                              <span className="text-[10px] font-semibold px-1 py-0.5 rounded bg-primary/15 text-primary leading-none">
                                Atlassian
                              </span>
                            )}
                            {isVerified && !isAtlassian && (
                              <span className="text-[10px] font-medium px-1 py-0.5 rounded bg-muted text-muted-foreground leading-none">
                                verified
                              </span>
                            )}
                          </div>
                          {vendorName && (
                            <div className="text-xs text-muted-foreground truncate">{vendorName}</div>
                          )}
                        </div>
                      </div>

                      {/* Summary */}
                      {(app.tagLine ?? app.summary) && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {app.tagLine ?? app.summary}
                        </p>
                      )}

                      {/* Meta row */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        {rating != null && rating > 0 && (
                          <span className="text-muted-foreground">
                            {rating.toFixed(1)} ★
                          </span>
                        )}
                        {installs != null && installs > 0 && (
                          <span className="text-muted-foreground">
                            {(installs / 1000).toFixed(0)}k installs
                          </span>
                        )}
                      </div>

                      {/* Booth match */}
                      <div className="flex items-center justify-between pt-1 border-t border-border">
                        {matchedBooth ? (
                          <>
                            <span className="text-xs text-muted-foreground">Booth {matchedBooth.id}</span>
                            {onAddBooth && (
                              <button
                                onClick={() => onAddBooth(matchedBooth.id)}
                                disabled={inRoute}
                                className={`text-xs font-medium px-2.5 py-1 rounded transition-colors ${
                                  inRoute
                                    ? 'bg-primary/15 text-primary cursor-default'
                                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                }`}
                              >
                                {inRoute ? 'In route' : 'Add to route'}
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">booth not mapped yet</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
