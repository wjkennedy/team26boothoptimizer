import { Booth } from '@/lib/distance-utils'

// ExpoFP API configuration for Team 26 event
const EXPO_EVENT_ID = 'team26'
const EXPO_DATA_URL = 'https://team26.expofp.com/api/v1/event'

/**
 * Curated Quest Route for Team 26
 * Optimized path through all major booths
 */
export const QUEST_ROUTE_ORDER = [
  'Event Check-In',
  // Southern edge first
  '2212', '2213', '2216', '2217', '2220', '2222', '2223', '2226', '2227',
  '2228', '2229', '2312', '2313', '2316', '2317', '2413', '2414', '2416',
  '2417', '2513', '2516', '2517', '2522', '2612', '2613', '2616', '2617',
  '2712', '2716',
  // Central spine
  '1720', '1722', '1726', '1728', '1732', '1735', '1738', '1740', '1745',
  '1818', '1820', '1920', '1822', '1823', '1826', '1828', '1830', '1836',
  '1922', '1923', '1926', '1928', '1929', '1932', '1935', '1938', '2026',
  '2028', '2112', '2113', '2116', '2117', '2136', '2151', '2153', '2156',
  '2161', '2163',
  // Upper and outer booths
  '2272', '2339', '2345', '2372', '2563', '2565', '2572', '2649', '2666',
  '2669', '2672', '2713', '2735', '2744', '2766', '2769', '2815', '2850',
  '2856', '2938', '2954', '2959', '3221', '3246',
]

/**
 * Fetch real booth data from ExpoFP API
 */
export async function getBoothsFromExpoFP(): Promise<Booth[]> {
  try {
    // ExpoFP provides booth data through their global window object when loaded
    // For server-side, we need to construct the booth list from the event data
    const response = await fetch(EXPO_DATA_URL, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`ExpoFP API error: ${response.status}`)
    }

    const eventData = await response.json()
    return transformExpoFPData(eventData)
  } catch (error) {
    console.error('[v0] Failed to fetch booths from ExpoFP:', error)
    // Return mock data as fallback
    return getMockBooths()
  }
}

/**
 * Fetch booths using the client-side ExpoFP FloorPlan API
 * This is called from client components after ExpoFP is loaded
 */
export function getBoothsFromExpoFPClient(): Promise<Booth[]> {
  return new Promise((resolve) => {
    // Wait for ExpoFP to be available on window
    const checkExpoFP = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).ExpoFP) {
        clearInterval(checkExpoFP)
        
        // Get booths from the FloorPlan instance
        // This will be set by the wayfinding component
        const floorPlan = (window as any).__team26FloorPlan
        if (floorPlan) {
          const booths = floorPlan.boothsList()
          resolve(transformFloorPlanBooths(booths))
        } else {
          // Fallback to mock data
          resolve(getMockBooths())
        }
      }
    }, 100)

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkExpoFP)
      resolve(getMockBooths())
    }, 5000)
  })
}

/**
 * Transform ExpoFP FloorPlanBooth to our Booth interface
 */
function transformFloorPlanBooths(floorPlanBooths: any[]): Booth[] {
  return floorPlanBooths.map((fpBooth: any) => ({
    id: fpBooth.externalId || fpBooth.name,
    name: fpBooth.name,
    vendor: fpBooth.description || '',
    x: fpBooth.entity?.point?.x || 0,
    y: fpBooth.entity?.point?.y || 0,
    size: determineBoothSize(fpBooth),
    externalId: fpBooth.externalId,
  }))
}

/**
 * Transform ExpoFP API JSON response to our Booth interface
 */
function transformExpoFPData(eventData: any): Booth[] {
  if (!eventData.booths || !Array.isArray(eventData.booths)) {
    return getMockBooths()
  }

  return eventData.booths.map((booth: any) => ({
    id: booth.externalId || booth.name,
    name: booth.name,
    vendor: booth.description || '',
    x: booth.entity?.point?.x || 0,
    y: booth.entity?.point?.y || 0,
    size: determineBoothSize(booth),
    externalId: booth.externalId,
  }))
}

/**
 * Determine booth size category based on area or metadata
 */
function determineBoothSize(booth: any): 'small' | 'medium' | 'large' {
  // If booth has area info, use that
  if (booth.entity?.point) {
    const area = (booth.entity.point.w || 0) * (booth.entity.point.h || 0)
    if (area > 500) return 'large'
    if (area > 200) return 'medium'
    return 'small'
  }

  // Default to medium
  return 'medium'
}

/**
 * Get mock booths as fallback
 */
export function getMockBooths(): Booth[] {
  return [
    {
      id: '2212',
      name: 'Booth 2212/2213',
      vendor: 'Sample Vendor',
      x: 100,
      y: 100,
      size: 'large',
    },
    {
      id: '2216',
      name: 'Booth 2216/2217',
      vendor: 'Sample Vendor',
      x: 150,
      y: 100,
      size: 'large',
    },
    {
      id: '2220',
      name: 'Booth 2220',
      vendor: 'Sample Vendor',
      x: 200,
      y: 100,
      size: 'medium',
    },
    {
      id: '1720',
      name: 'Booth 1720',
      vendor: 'Sample Vendor',
      x: 100,
      y: 200,
      size: 'large',
    },
    {
      id: '1722',
      name: 'Booth 1722',
      vendor: 'Sample Vendor',
      x: 150,
      y: 200,
      size: 'medium',
    },
    {
      id: '1726',
      name: 'Booth 1726',
      vendor: 'Sample Vendor',
      x: 200,
      y: 200,
      size: 'medium',
    },
    {
      id: '2272',
      name: 'Booth 2272',
      vendor: 'Sample Vendor',
      x: 100,
      y: 300,
      size: 'small',
    },
    {
      id: '2339',
      name: 'Booth 2339',
      vendor: 'Sample Vendor',
      x: 150,
      y: 300,
      size: 'small',
    },
    {
      id: '2345',
      name: 'Booth 2345',
      vendor: 'Sample Vendor',
      x: 200,
      y: 300,
      size: 'medium',
    },
  ]
}
