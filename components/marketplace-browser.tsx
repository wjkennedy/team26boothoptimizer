'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Booth } from '@/lib/distance-utils'
import { fetchMarketplaceApps } from '@/lib/marketplace-api'
import type { MarketplaceApp } from '@/lib/marketplace-types'

interface MarketplaceBrowserProps {
  booths: Booth[]
  waypointIds: string[]
  onAddBooth?: (boothId: string) => void
}

const POPULAR_CATEGORIES = [
  'Development',
  'Project Management',
  'Reporting',
  'Integration',
  'Automation',
  'Security',
  'Agile',
]

function formatInstalls(n?: number): string {
  if (!n) return ''
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M installs`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k installs`
  return `${n} installs`
}

function formatPrice(app: MarketplaceApp): string {
  const pricing = app._embedded?.pricing
  if (!pricing) return ''
  if (pricing.isFree !== false) return 'Free'
  const monthly = pricing.pricing?.cloudMonthly
  if (monthly) return `$${monthly}/mo`
  return 'Paid'
}

export function MarketplaceBrowser({
  booths,
  waypointIds,
  onAddBooth,
}: MarketplaceBrowserProps) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [results, setResults] = useState<MarketplaceApp[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Prefetch popular categories on mount
  useEffect(() => {
    const prefetch = async () => {
      try {
        const apps = await fetchMarketplaceApps({
          hosting: 'cloud',
          category: ['Development'],
          limit: 12,
          offset: 0,
        })
        setResults(apps)
        setSelectedCategory('Development')
        setSearched(true)
      } catch (e) {
        console.error('[v0] Prefetch failed:', e)
      }
    }
    prefetch()
  }, [])

  const runSearch = useCallback(
    async (q: string) => {
      if (!q.trim() && !selectedCategory) {
        setResults([])
        setSearched(false)
        return
      }
      setIsSearching(true)
      setError(null)
      try {
        // Use category filter instead of unsupported query param
        const apps = await fetchMarketplaceApps({
          hosting: 'cloud',
          category: selectedCategory ? [selectedCategory] : undefined,
          limit: 24,
          offset: 0,
        })
        
        // If there's a query, filter locally by name/vendor/summary
        if (q.trim()) {
          const lowerQ = q.toLowerCase()
          const filtered = apps.filter(
            app =>
              app.name.toLowerCase().includes(lowerQ) ||
              app._embedded?.vendor?.name?.toLowerCase().includes(lowerQ) ||
              app.summary?.toLowerCase().includes(lowerQ) ||
              app.tagLine?.toLowerCase().includes(lowerQ)
          )
          setResults(filtered)
        } else {
          setResults(apps)
        }
        setSearched(true)
      } catch {
        setError('Could not reach Marketplace. Check your connection.')
        setResults([])
      } finally {
        setIsSearching(false)
      }
    },
    [selectedCategory]
  )

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(val), 350)
  }

  const handleCategoryClick = (cat: string) => {
    const newCategory = cat === selectedCategory ? null : cat
    setSelectedCategory(newCategory)
    setQuery('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    
    // Fetch immediately with the new category
    setIsSearching(true)
    setError(null)
    fetchMarketplaceApps({
      hosting: 'cloud',
      category: newCategory ? [newCategory] : undefined,
      limit: 24,
      offset: 0,
    })
      .then(apps => {
        setResults(apps)
        setSearched(true)
      })
      .catch(() => {
        setError('Could not reach Marketplace. Check your connection.')
        setResults([])
      })
      .finally(() => setIsSearching(false))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    runSearch(query)
  }

  // Fuzzy-match vendor name to booth
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
          Filter by category or search within results to find vendors exhibiting at Team 26.
        </p>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5">
        {POPULAR_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
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

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={handleInput}
            placeholder={selectedCategory ? `Search within ${selectedCategory}...` : 'Search by app or vendor name...'}
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            aria-label="Search Marketplace"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </form>

      {/* States */}
      {isSearching && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          Searching Marketplace...
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      {searched && !isSearching && results.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No results {selectedCategory ? `for ${selectedCategory}` : 'found'}.
        </p>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {results.length} result{results.length !== 1 ? 's' : ''} {selectedCategory ? `in ${selectedCategory}` : ''}{query ? ` matching "${query}"` : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[580px] overflow-y-auto pr-1">
            {results.map((app) => {
              const vendorName = app._embedded?.vendor?.name ?? ''
              const categories = (app._embedded?.categories ?? []).map(c => c.name)
              const rating = app._embedded?.distribution?.averageRating
              const installs = app._embedded?.distribution?.totalInstalls
              const isVerified = app._embedded?.vendor?.verifiedStatus === 'verified'
              const isAtlassian = app._embedded?.vendor?.isAtlassian ?? false
              const price = formatPrice(app)
              const matchedBooth = findBoothForApp(app)
              const inRoute = matchedBooth ? waypointIds.includes(matchedBooth.id) : false
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
                  <div className="flex items-center gap-2 flex-wrap">
                    {rating != null && rating > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {rating.toFixed(1)} ★
                      </span>
                    )}
                    {installs != null && installs > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {formatInstalls(installs)}
                      </span>
                    )}
                    {price && (
                      <span className="text-xs text-muted-foreground">{price}</span>
                    )}
                    {categories.slice(0, 2).map(cat => (
                      <span
                        key={cat}
                        className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded"
                      >
                        {cat}
                      </span>
                    ))}
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
        </div>
      )}

      {/* Empty state */}
      {!searched && !isSearching && (
        <div className="text-center py-12 text-muted-foreground">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <p className="text-sm">Select a category or search to get started</p>
        </div>
      )}
    </div>
  )
}
