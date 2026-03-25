import type { MarketplaceApp, MarketplaceResponse, FetchAppsParams } from "./marketplace-types"

const MARKETPLACE_API_BASE = "https://marketplace.atlassian.com/rest/2"

export async function fetchMarketplaceApps(params: FetchAppsParams = {}): Promise<MarketplaceApp[]> {
  const queryParams = new URLSearchParams()

  if (params.application) queryParams.append("application", params.application)
  if (params.hosting) queryParams.append("hosting", params.hosting)
  if (params.category) {
    params.category.forEach((cat) => queryParams.append("category", cat))
  }
  if (params.cost) queryParams.append("cost", params.cost)
  if (params.limit) queryParams.append("limit", params.limit.toString())
  if (params.offset) queryParams.append("offset", params.offset.toString())

  // Add embed parameters to get full data
  queryParams.append("hosting", "cloud")

  const url = `${MARKETPLACE_API_BASE}/addons?${queryParams.toString()}`

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data: MarketplaceResponse = await response.json()
    return data._embedded.addons
  } catch (error) {
    throw error
  }
}

export async function fetchAllMarketplaceApps(params: FetchAppsParams = {}, maxApps = 5000): Promise<MarketplaceApp[]> {
  const allApps: MarketplaceApp[] = []
  const limit = 50
  let offset = 0

  while (allApps.length < maxApps) {
    const apps = await fetchMarketplaceApps({
      ...params,
      limit,
      offset,
    })

    if (apps.length === 0) break

    allApps.push(...apps)
    offset += limit

    // Stop if we got fewer results than requested
    if (apps.length < limit) break
  }

  return allApps.slice(0, maxApps)
}
