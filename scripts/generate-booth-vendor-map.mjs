#!/usr/bin/env node

import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

async function fetchJson(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`)
  }
  return response.json()
}

async function main() {
  console.log('[v0] Fetching ExpoFP data for Team 26...')

  try {
    // Fetch booths and full event data
    const [boothsData, eventData] = await Promise.all([
      fetchJson('https://team26.expofp.com/data/booths.json'),
      fetchJson('https://team26.expofp.com/data/data.json').catch(() => null),
    ])

    if (!Array.isArray(boothsData)) {
      throw new Error('booths.json is not an array')
    }

    console.log(`[v0] Loaded ${boothsData.length} booths`)

    if (!eventData) {
      console.warn('[v0] data.json not available, trying offline archive...')
      // The offline archive approach would go here if needed
      // For now, we'll try the exhibitor endpoint which may work without auth for Team 26
    }

    let exhibitorsData = []
    if (eventData && Array.isArray(eventData.exhibitors)) {
      exhibitorsData = eventData.exhibitors
      console.log(`[v0] Loaded ${exhibitorsData.length} exhibitors from data.json`)
    }

    // Build booth-to-vendor map
    const boothVendorMap = {}

    if (exhibitorsData.length > 0) {
      // If exhibitors data is available, map booths to exhibitor names
      for (const booth of boothsData) {
        if (!booth.id || typeof booth.id !== 'string') continue

        // Skip non-booth entries
        if (booth.id.includes('Parking') || booth.id.includes('Hotel') ||
            booth.id.includes('Hall D') || booth.id.includes('Bash') ||
            booth.id.includes('Arena')) {
          continue
        }

        // Find exhibitors for this booth
        if (Array.isArray(booth.exhibitors) && booth.exhibitors.length > 0) {
          const exhibitorIds = booth.exhibitors.map(id => Number(id))
          const matchingExhibitors = exhibitorsData.filter(ex =>
            exhibitorIds.includes(Number(ex.id))
          )

          if (matchingExhibitors.length > 0) {
            // Use the first exhibitor name as the vendor
            boothVendorMap[booth.id] = matchingExhibitors[0].name
          }
        }
      }
    } else {
      console.warn('[v0] No exhibitor data available. Map will be empty.')
      console.log('[v0] Retrying with exhibitor list endpoint...')

      try {
        // Try the exhibitor list endpoint
        const exhibitorListUrl = 'https://team26.expofp.com/api/v2/exhibitor/getList'
        const exhibitorListData = await fetchJson(exhibitorListUrl)

        if (Array.isArray(exhibitorListData)) {
          exhibitorsData = exhibitorListData
          console.log(`[v0] Loaded ${exhibitorsData.length} exhibitors from API`)

          // Re-map with API data
          for (const booth of boothsData) {
            if (!booth.id || typeof booth.id !== 'string') continue
            if (booth.id.includes('Parking') || booth.id.includes('Hotel') ||
                booth.id.includes('Hall D') || booth.id.includes('Bash') ||
                booth.id.includes('Arena')) {
              continue
            }

            if (Array.isArray(booth.exhibitors) && booth.exhibitors.length > 0) {
              const exhibitorIds = booth.exhibitors.map(id => Number(id))
              const matchingExhibitors = exhibitorsData.filter(ex =>
                exhibitorIds.includes(Number(ex.id))
              )
              if (matchingExhibitors.length > 0) {
                boothVendorMap[booth.id] = matchingExhibitors[0].name
              }
            }
          }
        }
      } catch (e) {
        console.warn('[v0] Exhibitor API endpoint not accessible:', e.message)
      }
    }

    const mappedCount = Object.keys(boothVendorMap).length
    console.log(`[v0] Mapped ${mappedCount} booths to vendor names`)

    // Generate TypeScript file
    const outputPath = path.join(projectRoot, 'lib', 'booth-vendor-map.ts')
    const content = `// Auto-generated booth-to-vendor mapping from ExpoFP data
// Generated: ${new Date().toISOString()}

export const boothVendorMap: Record<string, string> = ${JSON.stringify(boothVendorMap, null, 2)}
`

    await mkdir(path.dirname(outputPath), { recursive: true })
    await writeFile(outputPath, content, 'utf8')

    console.log(`[v0] Generated ${outputPath}`)
    console.log(`[v0] Total vendors mapped: ${mappedCount}`)

  } catch (error) {
    console.error('[v0] Error generating booth vendor map:', error.message)
    process.exit(1)
  }
}

main()
