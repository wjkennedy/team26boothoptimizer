// Atlassian Marketplace API Types
export interface MarketplaceApp {
  _links: {
    self: { href: string }
    alternate: { href: string }
    vendor?: { href: string }
  }
  _embedded?: {
    vendor?: {
      _links: { self: { href: string } }
      name: string
      verifiedStatus?: string
      isAtlassian?: boolean
    }
    categories?: Array<{
      _links: { self: { href: string } }
      name: string
    }>
    distribution?: {
      bundled?: boolean
      bundledCloud?: boolean
      downloads?: number
      totalInstalls?: number
      averageRating?: number
    }
    pricing?: {
      isFree?: boolean
      pricing?: {
        cloudMonthly?: number
        serverAnnual?: number
        dataCenter?: number
      }
    }
    hosting?: string[]
    version?: {
      compatibilities?: Array<{
        application: {
          key: string
          name: string
        }
      }>
    }
  }
  name: string
  key: string
  tagLine?: string
  summary?: string
  status?: string
}

export interface MarketplaceResponse {
  _links: {
    self: { href: string }
    next?: Array<{ href: string }>
  }
  _embedded: {
    addons: MarketplaceApp[]
  }
  count: number
}

export interface FetchAppsParams {
  application?: string
  hosting?: string
  category?: string[]
  cost?: string
  limit?: number
  offset?: number
}
