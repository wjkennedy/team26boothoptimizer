// Simple in-memory cache for marketplace data
// This persists for the duration of the session to avoid hammering the Marketplace API

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

const cache = new Map<string, CacheEntry<any>>()

const DEFAULT_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

export function getCacheKey(params: Record<string, any>): string {
  return JSON.stringify(params)
}

export function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null

  const now = Date.now()
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(key)
    return null
  }

  return entry.data as T
}

export function setInCache<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  })
}

export function clearCache(): void {
  cache.clear()
}

export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  }
}
