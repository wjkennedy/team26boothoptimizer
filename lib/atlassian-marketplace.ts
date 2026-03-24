/**
 * Atlassian Marketplace REST API v3 Integration
 * Fetches app listing information for vendors/developers
 */

export interface MarketplaceApp {
  productId: string
  appKey: string
  developerId: string
  appName: string
  summary: string
  tagLine: string
  images?: {
    iconFileId?: string
    titleLogoFileId?: string
    bannerFileId?: string
  }
  tags?: {
    category?: Array<{ id: string; name: string }>
    keywords?: Array<{ id: string; name: string }>
  }
  state: string
  approvalStatus: string
  slug: string
}

/**
 * Fetch app listing for a specific product ID
 */
export async function getMarketplaceApp(
  productId: string,
  credentials?: { email: string; token: string }
): Promise<MarketplaceApp | null> {
  try {
    const url = `https://api.atlassian.com/marketplace/rest/3/product-listing/${productId}`

    const headers: Record<string, string> = {
      Accept: 'application/json',
    }

    // Add basic auth if credentials provided
    if (credentials) {
      const auth = btoa(`${credentials.email}:${credentials.token}`)
      headers.Authorization = `Basic ${auth}`
    }

    const response = await fetch(url, { headers })

    if (!response.ok) {
      console.error(`[v0] Marketplace API error: ${response.status}`)
      return null
    }

    const data: MarketplaceApp = await response.json()
    return data
  } catch (error) {
    console.error('[v0] Failed to fetch marketplace app:', error)
    return null
  }
}

/**
 * Fetch all apps for a specific developer
 */
export async function getMarketplaceAppsForDeveloper(
  developerId: string,
  credentials?: { email: string; token: string }
): Promise<MarketplaceApp[]> {
  try {
    const url = `https://api.atlassian.com/marketplace/rest/3/product-listing/developer-space/${developerId}`

    const headers: Record<string, string> = {
      Accept: 'application/json',
    }

    if (credentials) {
      const auth = btoa(`${credentials.email}:${credentials.token}`)
      headers.Authorization = `Basic ${auth}`
    }

    const response = await fetch(url, { headers })

    if (!response.ok) {
      console.error(`[v0] Marketplace API error: ${response.status}`)
      return []
    }

    const data = await response.json()
    // Response might be an array or have a results property
    return Array.isArray(data) ? data : data.results || []
  } catch (error) {
    console.error('[v0] Failed to fetch marketplace apps for developer:', error)
    return []
  }
}

/**
 * Cache for marketplace app data to avoid repeated API calls
 */
const marketplaceCache = new Map<string, MarketplaceApp>()

/**
 * Fetch marketplace app with caching
 */
export async function getCachedMarketplaceApp(
  productId: string,
  credentials?: { email: string; token: string }
): Promise<MarketplaceApp | null> {
  if (marketplaceCache.has(productId)) {
    return marketplaceCache.get(productId) || null
  }

  const app = await getMarketplaceApp(productId, credentials)
  if (app) {
    marketplaceCache.set(productId, app)
  }
  return app
}

/**
 * Parse marketplace app data into booth vendor info
 */
export function enrichBoothWithMarketplaceData(
  boothId: string,
  marketplaceApp: MarketplaceApp | null
): { vendor: string; appUrl?: string; category?: string } {
  if (!marketplaceApp) {
    return { vendor: '' }
  }

  return {
    vendor: marketplaceApp.appName,
    appUrl: `https://marketplace.atlassian.com/apps/${marketplaceApp.appKey}`,
    category: marketplaceApp.tags?.category?.[0]?.name,
  }
}
