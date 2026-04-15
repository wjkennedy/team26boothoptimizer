export interface Booth {
  id: string
  name: string
  vendor: string
  description?: string
  x: number
  y: number
  size: 'small' | 'medium' | 'large'
  externalId?: string
}

export interface RouteStop {
  position: number
  booth: Booth
  distanceFromPrevious: number
}

export interface RouteResult {
  route: RouteStop[]
  totalDistance: number
  totalBooths: number
  efficiency: number // booths per meter
}

/**
 * Calculate Euclidean distance between two points in meters
 */
export function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Serpentine routing: Row-by-row sweeping motion
 * Minimizes backtracking by working systematically through sections
 */
export function calculateSerpentineRoute(booths: Booth[]): RouteResult {
  if (booths.length === 0) {
    return { route: [], totalDistance: 0, totalBooths: 0, efficiency: 0 }
  }

  // Sort by Y coordinate (row), then X coordinate
  const sorted = [...booths].sort((a, b) => {
    const rowDiff = Math.floor(a.y / 50) - Math.floor(b.y / 50)
    if (rowDiff !== 0) return rowDiff

    // Alternate direction for each row (serpentine)
    const row = Math.floor(a.y / 50)
    return row % 2 === 0 ? a.x - b.x : b.x - a.x
  })

  return buildRoute(sorted)
}

/**
 * Big-to-Small routing: Visit larger booths first, then use nearest-neighbor
 */
export function calculateBigToSmallRoute(booths: Booth[]): RouteResult {
  if (booths.length === 0) {
    return { route: [], totalDistance: 0, totalBooths: 0, efficiency: 0 }
  }

  const sizeOrder = { large: 0, medium: 1, small: 2 }
  const sorted = [...booths].sort(
    (a, b) => sizeOrder[a.size] - sizeOrder[b.size]
  )

  // Apply nearest-neighbor optimization between booths of same size group
  const route = greedyNearestNeighbor(sorted)
  return buildRoute(route)
}

/**
 * Quest-Motivated routing: Follows the optimized quest path
 * Prioritizes booths in the curated quest order, with nearest-neighbor optimization for unmapped booths
 */
export function calculateQuestMotivatedRoute(booths: Booth[]): RouteResult {
  if (booths.length === 0) {
    return { route: [], totalDistance: 0, totalBooths: 0, efficiency: 0 }
  }

  // Import the quest order
  const { QUEST_ROUTE_ORDER } = require('@/lib/booth-data')

  // Create a map of booth ID/name to booth for quick lookup
  const boothMap = new Map<string, Booth>()
  booths.forEach((booth) => {
    boothMap.set(booth.id, booth)
    boothMap.set(booth.name, booth)
    boothMap.set(booth.id.replace(/\D/g, ''), booth) // Store numeric ID
  })

  // Build route following quest order
  const route: Booth[] = []
  const used = new Set<string>()

  for (const questBoothId of QUEST_ROUTE_ORDER) {
    // Try exact match
    let booth = boothMap.get(questBoothId)

    // Try numeric ID match
    if (!booth) {
      const numericId = questBoothId.replace(/\D/g, '')
      if (numericId) {
        for (const [key, b] of boothMap.entries()) {
          if (key.includes(numericId) && !used.has(b.id)) {
            booth = b
            break
          }
        }
      }
    }

    if (booth && !used.has(booth.id)) {
      route.push(booth)
      used.add(booth.id)
    }
  }

  // Add any remaining booths using nearest-neighbor
  const remaining = booths.filter((b) => !used.has(b.id))
  if (remaining.length > 0 && route.length > 0) {
    const lastBooth = route[route.length - 1]
    const additionalBooths = greedyNearestNeighbor([lastBooth, ...remaining]).slice(1)
    route.push(...additionalBooths)
  } else if (remaining.length > 0) {
    route.push(...remaining)
  }

  return buildRoute(route)
}

/**
 * ExpoFP-style optimized routing: mirrors getOptimizedRoutes() TSP heuristic.
 * Tries nearest-neighbor starting from every booth and picks the shortest total path.
 * This is the same approach ExpoFP's SDK uses internally — useful for side-by-side comparison.
 */
export function calculateExpofpOptimizedRoute(booths: Booth[]): RouteResult {
  if (booths.length === 0) {
    return { route: [], totalDistance: 0, totalBooths: 0, efficiency: 0 }
  }

  let bestRoute: Booth[] = []
  let bestDistance = Infinity

  for (let start = 0; start < booths.length; start++) {
    const ordered = [booths[start], ...booths.filter((_, i) => i !== start)]
    const candidate = greedyNearestNeighbor(ordered)
    let dist = 0
    for (let i = 1; i < candidate.length; i++) {
      dist += calculateDistance(candidate[i - 1].x, candidate[i - 1].y, candidate[i].x, candidate[i].y)
    }
    if (dist < bestDistance) {
      bestDistance = dist
      bestRoute = candidate
    }
  }

  return buildRoute(bestRoute)
}

/**
 * Greedy nearest-neighbor algorithm: At each step, visit the closest unvisited booth
 */
function greedyNearestNeighbor(booths: Booth[]): Booth[] {
  if (booths.length === 0) return []
  if (booths.length === 1) return booths

  const route: Booth[] = [booths[0]]
  const remaining = new Set(booths.slice(1))

  while (remaining.size > 0) {
    const current = route[route.length - 1]
    let closest: Booth | null = null
    let minDistance = Infinity

    for (const booth of remaining) {
      const dist = calculateDistance(current.x, current.y, booth.x, booth.y)
      if (dist < minDistance) {
        minDistance = dist
        closest = booth
      }
    }

    if (closest) {
      route.push(closest)
      remaining.delete(closest)
    }
  }

  return route
}

/**
 * Build route with distances and efficiency metrics
 */
function buildRoute(orderedBooths: Booth[]): RouteResult {
  if (orderedBooths.length === 0) {
    return { route: [], totalDistance: 0, totalBooths: 0, efficiency: 0 }
  }

  const route: RouteStop[] = []
  let totalDistance = 0

  for (let i = 0; i < orderedBooths.length; i++) {
    const booth = orderedBooths[i]
    let distanceFromPrevious = 0

    if (i > 0) {
      const prev = orderedBooths[i - 1]
      distanceFromPrevious = calculateDistance(prev.x, prev.y, booth.x, booth.y)
      totalDistance += distanceFromPrevious
    }

    route.push({
      position: i + 1,
      booth,
      distanceFromPrevious,
    })
  }

  return {
    route,
    totalDistance: Math.round(totalDistance * 100) / 100,
    totalBooths: orderedBooths.length,
    efficiency:
      orderedBooths.length > 0
        ? Math.round((orderedBooths.length / (totalDistance || 1)) * 1000) / 1000
        : 0,
  }
}
