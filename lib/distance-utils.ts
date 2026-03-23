export interface Booth {
  id: string
  name: string
  vendor: string
  x: number
  y: number
  size: 'small' | 'medium' | 'large'
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
 * Quest-Motivated routing: Prioritizes booths by quest criteria
 * Currently uses vendor alphabetical order as placeholder
 */
export function calculateQuestMotivatedRoute(booths: Booth[]): RouteResult {
  if (booths.length === 0) {
    return { route: [], totalDistance: 0, totalBooths: 0, efficiency: 0 }
  }

  // Placeholder: Sort by vendor name (represents quest ordering)
  const sorted = [...booths].sort((a, b) =>
    a.vendor.localeCompare(b.vendor)
  )

  // Apply nearest-neighbor optimization
  const route = greedyNearestNeighbor(sorted)
  return buildRoute(route)
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
        ? Math.round((orderedBooths.length / totalDistance) * 1000) / 1000
        : 0,
  }
}
