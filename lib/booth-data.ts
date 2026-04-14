import { Booth } from '@/lib/distance-utils'

// ExpoFP API configuration for Team 26 event - Public endpoint, no auth needed
const EXPO_DATA_URL = 'https://team26.expofp.com/data/booths.json'
const EXPO_COMPANIES_URL = 'https://team26.expofp.com/api/v2/exhibitor/getList'

// Curated Quest Route for Team 26
export const QUEST_ROUTE_ORDER = [
  'Event Check-In',
  '2212', '2213', '2216', '2217', '2220', '2222', '2223', '2226', '2227',
  '2228', '2229', '2312', '2313', '2316', '2317', '2413', '2414', '2416',
  '2417', '2513', '2516', '2517', '2522', '2612', '2613', '2616', '2617',
  '2712', '2716',
  '1720', '1722', '1726', '1728', '1732', '1735', '1738', '1740', '1745',
  '1818', '1820', '1920', '1822', '1823', '1826', '1828', '1830', '1836',
  '1922', '1923', '1926', '1928', '1929', '1932', '1935', '1938', '2026',
  '2028', '2112', '2113', '2116', '2117', '2136', '2151', '2153', '2156',
  '2161', '2163',
  '2272', '2339', '2345', '2372', '2563', '2565', '2572', '2649', '2666',
  '2669', '2672', '2713', '2735', '2744', '2766', '2769', '2815', '2850',
  '2856', '2938', '2954', '2959', '3221', '3246',
]

interface ExpoFPExhibitor {
  id: string
  boothId?: string
  booth_id?: string
  name?: string
  company?: string
  [key: string]: any
}

interface ExpoFPBooth {
  id: string
  name?: string
  company?: string
  vendor?: string
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

export async function getBoothsFromExpoFP(): Promise<Booth[]> {
  try {
    const boothsResponse = await fetch(EXPO_DATA_URL)
    
    if (!boothsResponse.ok) {
      throw new Error(`Booths API error: ${boothsResponse.status}`)
    }
    
    const boothData: ExpoFPResponse = await boothsResponse.json()
    
    // Log the structure of the first booth to debug what fields are available
    if (boothData.booths && boothData.booths[0] && boothData.booths[0].booths && boothData.booths[0].booths[0]) {
      console.log('[v0] Sample booth structure:', JSON.stringify(boothData.booths[0].booths[0], null, 2))
    }
    
    return transformExpoFPData(boothData)
  } catch (error) {
    console.error('[v0] Failed to fetch booths:', error)
    return getMockBooths()
  }
}

function buildExhibitorMap(exhibitorData: any): Map<string, string> {
  const map = new Map<string, string>()
  
  if (Array.isArray(exhibitorData)) {
    exhibitorData.forEach((ex: ExpoFPExhibitor) => {
      const boothId = ex.boothId ?? ex.booth_id ?? ex.id
      const company = ex.company ?? ex.name ?? ''
      if (boothId && company) {
        map.set(String(boothId), company)
      }
    })
  } else if (exhibitorData?.data && Array.isArray(exhibitorData.data)) {
    exhibitorData.data.forEach((ex: ExpoFPExhibitor) => {
      const boothId = ex.boothId ?? ex.booth_id ?? ex.id
      const company = ex.company ?? ex.name ?? ''
      if (boothId && company) {
        map.set(String(boothId), company)
      }
    })
  }
  
  return map
}

function transformExpoFPData(data: ExpoFPResponse): Booth[] {
  const booths: Booth[] = []
  let boothsWithVendor = 0
  
  for (const level of data.booths) {
    for (const booth of level.booths) {
      if (booth.id.includes('Parking') || booth.id.includes('Hotel') || 
          booth.id.includes('Hall D') || booth.id.includes('Bash') || 
          booth.id.includes('Arena')) {
        continue
      }

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

      // Extract vendor name from booth data - try company or vendor fields
      const vendorName = booth.company ?? booth.vendor ?? ''
      
      if (vendorName) boothsWithVendor++

      booths.push({
        id: booth.id,
        name: booth.name ?? `Booth ${booth.id}`,
        vendor: vendorName,
        x,
        y,
        size,
        externalId: booth.id,
      })
    }
  }

  console.log('[v0] Loaded', booths.length, 'booths,', boothsWithVendor, 'with vendor data')
  if (boothsWithVendor === 0 && booths.length > 0) {
    console.log('[v0] Sample booth:', booths[0])
  }

  return booths
}

export function getMockBooths(): Booth[] {
  return [
    { id: '2212', name: 'Booth 2212/2213', vendor: 'Sample', x: 100, y: 100, size: 'large' },
    { id: '2216', name: 'Booth 2216/2217', vendor: 'Sample', x: 150, y: 100, size: 'large' },
    { id: '2220', name: 'Booth 2220', vendor: 'Sample', x: 200, y: 100, size: 'medium' },
    { id: '1720', name: 'Booth 1720', vendor: 'Sample', x: 100, y: 200, size: 'large' },
    { id: '1722', name: 'Booth 1722', vendor: 'Sample', x: 150, y: 200, size: 'medium' },
    { id: '1726', name: 'Booth 1726', vendor: 'Sample', x: 200, y: 200, size: 'medium' },
  ]
}
