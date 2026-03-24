'use client'

import { useState, useCallback, useRef } from 'react'
import { Booth } from '@/lib/distance-utils'

interface MarketplaceResult {
  appKey: string
  name: string
  summary: string
  vendorName: string
  vendorId: string
  logoUrl?: string
  marketplaceUrl: string
  categories: string[]
}

interface MarketplaceBrowserProps {
  booths: Booth[]
  waypointIds: string[]
  onAddBooth?: (boothId: string) => void
}

// Atlassian Marketplace public search — no auth required for public listings
async function searchMarketplace(query: string): Promise<MarketplaceResult[]> {
  const url = `https://marketplace.atlassian.com/rest/2/addons?query=${encodeURIComponent(query)}&limit=20&offset=0`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Marketplace search failed: ${res.status}`)
  const data = await res.json()
  const addons = data?._embedded?.addons ?? []

  return addons.map((addon: any) => ({
    appKey: addon.key ?? '',
    name: addon.name ?? '',
    summary: addon.summary ?? '',
    vendorName: addon._embedded?.vendor?.name ?? '',
    vendorId: addon._embedded?.vendor?.id ?? '',
    logoUrl: addon._links?.logo?.href ?? undefined,
    marketplaceUrl: addon._links?.self?.href
      ? `https://marketplace.atlassian.com/apps/${addon.key}`
      : '',
    categories: (addon._embedded?.categories ?? []).map((c: any) => c.name),
  }))
}

export function MarketplaceBrowser({
  booths,
  waypointIds,
  onAddBooth,
}: MarketplaceBrowserProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MarketplaceResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setSearched(false)
      return
    }
    setIsSearching(true)
    setError(null)
    try {
      const res = await searchMarketplace(q.trim())
      setResults(res)
      setSearched(true)
    } catch (e: any) {
      setError('Could not reach Marketplace API. Check your connection.')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(val), 450)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    runSearch(query)
  }

  // Try to match a result to a booth by vendor name
  const findBoothForVendor = (vendorName: string): Booth | undefined => {
    const lower = vendorName.toLowerCase()
    return booths.find(
      b => b.vendor && b.vendor.toLowerCase().includes(lower)
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Browse Marketplace Vendors</h2>
        <p className="text-sm text-muted-foreground">
          Search Atlassian Marketplace to find vendors, then locate their booths on the floor plan.
        </p>
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
            placeholder="Search by app name, vendor, or category..."
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
        <div className="text-sm text-muted-foreground py-4 text-center">
          No results found for &quot;{query}&quot;.
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;</p>
          <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
            {results.map((app) => {
              const matchedBooth = findBoothForVendor(app.vendorName || app.name)
              const inRoute = matchedBooth ? waypointIds.includes(matchedBooth.id) : false

              return (
                <div
                  key={app.appKey}
                  className="p-3 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Logo */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                      {app.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={app.logoUrl}
                          alt={`${app.name} logo`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <a
                            href={app.marketplaceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-sm text-foreground hover:text-primary transition-colors"
                          >
                            {app.name}
                          </a>
                          {app.vendorName && (
                            <div className="text-xs text-muted-foreground">{app.vendorName}</div>
                          )}
                        </div>

                        {/* Booth match action */}
                        {matchedBooth ? (
                          <div className="flex-shrink-0 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Booth {matchedBooth.id}</span>
                            {onAddBooth && (
                              <button
                                onClick={() => onAddBooth(matchedBooth.id)}
                                disabled={inRoute}
                                className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                                  inRoute
                                    ? 'bg-primary/20 text-primary cursor-default'
                                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                }`}
                              >
                                {inRoute ? 'In route' : 'Add to route'}
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="flex-shrink-0 text-xs text-muted-foreground/50 italic">
                            booth TBD
                          </span>
                        )}
                      </div>

                      {app.summary && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                          {app.summary}
                        </p>
                      )}

                      {app.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {app.categories.slice(0, 3).map(cat => (
                            <span
                              key={cat}
                              className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-sm">Search for a vendor or app to find their booth</p>
          <p className="text-xs mt-1 opacity-70">e.g. "Jira", "ScriptRunner", "Atlassian"</p>
        </div>
      )}
    </div>
  )
}
