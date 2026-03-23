import { Booth } from '@/lib/distance-utils'

// ExpoFP API configuration for Team 26 event
// No authentication required - data is publicly accessible
const EXPO_DATA_URL = 'https://team26.expofp.com/data/booths.json'

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
 * Booth data structure from ExpoFP
 */
interface ExpoFPBooth {
  id: string
  rect: [number, number, number, number, number, number, number, number]
}

interface ExpoFPLevel {
  level: {
    name: string
    index: number
  }
  booths: ExpoFPBooth[]
}

interface ExpoFPResponse {
  version: number
  timestamp: number
  units: string
  booths: ExpoFPLevel[]
}

/**
 * Fetch real booth data from ExpoFP API
 * Uses public endpoint: https://team26.expofp.com/data/booths.json
 * No authentication token required
 */
export async function getBoothsFromExpoFP(): Promise<Booth[]> {
  try {
    console.log('[v0] Fetching booths from ExpoFP API...')
    const response = await fetch(EXPO_DATA_URL, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`ExpoFP API error: ${response.status}`)
    }

    const data: ExpoFPResponse = await response.json()
    console.log('[v0] ExpoFP API returned:', data.version, 'version,', data.booths.length, 'levels')
    
    return transformExpoFPData(data)
  } catch (error) {
    console.error('[v0] Failed to fetch booths from ExpoFP:', error)
    return getMockBooths()
  }
}

/**
 * Transform ExpoFP response to our Booth interface
 * Filters out parking/hotel entries and keeps only numbered booths
 */
function transformExpoFPData(data: ExpoFPResponse): Booth[] {
  const booths: Booth[] = []

  for (const level of data.booths) {
    for (const booth of level.booths) {
      // Skip parking and hotel entries - focus on numbered booths
      if (
        booth.id.includes('Parking') ||
        booth.id.includes('Hotel') ||
        booth.id.includes('Hall D') ||
        booth.id.includes('Bash') ||
        booth.id.includes('Arena')
      ) {
        continue
      }

      // Extract booth coordinates from rect (polygon with 4 points in feet)
      const rect = booth.rect
      const x = (rect[0] + rect[2]) / 2 // center x
      const y = (rect[1] + rect[5]) / 2 // center y
      const width = Math.abs(rect[2] - rect[0])
      const height = Math.abs(rect[5] - rect[1])
      const area = width * height

      // Determine size based on area (in square feet)
      let size: 'small' | 'medium' | 'large' = 'medium'
      if (area > 2000) size = 'large'
      else if (area > 500) size = 'medium'
      else size = 'small'

      booths.push({
        id: booth.id,
        name: `Booth ${booth.id}`,
        vendor: '',
        x,
        y,
        size,
        externalId: booth.id,
      })
    }
  }

  console.log('[v0] Transformed', booths.length, 'booths from ExpoFP data')
  return booths
}

/**
 * Get mock booths as fallback
 */
export function getMockBooths(): Booth[] {
  console.log('[v0] Using mock booth data (fallback)')
  return [
    { id: '2212', name: 'Booth 2212/2213', vendor: 'Sample Vendor', x: 100, y: 100, size: 'large' },
    { id: '2216', name: 'Booth 2216/2217', vendor: 'Sample Vendor', x: 150, y: 100, size: 'large' },
    { id: '2220', name: 'Booth 2220', vendor: 'Sample Vendor', x: 200, y: 100, size: 'medium' },
    { id: '1720', name: 'Booth 1720', vendor: 'Sample Vendor', x: 100, y: 200, size: 'large' },
    { id: '1722', name: 'Booth 1722', vendor: 'Sample Vendor', x: 150, y: 200, size: 'medium' },
    { id: '1726', name: 'Booth 1726', vendor: 'Sample Vendor', x: 200, y: 200, size: 'medium' },
    { id: '2272', name: 'Booth 2272', vendor: 'Sample Vendor', x: 100, y: 300, size: 'small' },
    { id: '2339', name: 'Booth 2339', vendor: 'Sample Vendor', x: 150, y: 300, size: 'small' },
    { id: '2345', name: 'Booth 2345', vendor: 'Sample Vendor', x: 200, y: 300, size: 'medium' },
  ]
}
