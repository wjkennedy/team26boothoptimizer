/**
 * Fuzzy vendor name matching to handle partial matches
 * e.g., "Seibert" matches "Seibert Group" or "The Seibert Company"
 */

/**
 * Normalize vendor name for matching (lowercase, trim whitespace, remove common words)
 */
export function normalizeVendorName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/^(the|a|an)\s+/i, '') // Remove leading "the", "a", "an"
    .replace(/\s+(inc|llc|ltd|co|corp|company|group|solutions|software|systems|services|technologies|tech)\s*\.?$/i, '') // Remove common suffixes
}

/**
 * Calculate similarity score between two strings (0-1)
 * Uses a simple algorithm that checks substring containment and length similarity
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const n1 = normalizeVendorName(str1)
  const n2 = normalizeVendorName(str2)
  
  if (n1 === n2) return 1.0 // Exact match
  
  // Check if one is a substring of the other
  if (n1.includes(n2) || n2.includes(n1)) return 0.85
  
  // Check for word overlap (at least 80% of words match)
  const words1 = n1.split(/\s+/).filter(w => w.length > 0)
  const words2 = n2.split(/\s+/).filter(w => w.length > 0)
  
  if (words1.length === 0 || words2.length === 0) return 0
  
  const commonWords = words1.filter(w => words2.some(w2 => w2.includes(w) || w.includes(w2)))
  const matchRatio = commonWords.length / Math.max(words1.length, words2.length)
  
  return matchRatio > 0.6 ? 0.75 : 0
}

/**
 * Find best matching vendor name from a list
 * Returns the matched name and similarity score if > threshold, otherwise null
 */
export function findBestVendorMatch(
  queryVendor: string,
  candidateNames: string[],
  threshold: number = 0.7
): { name: string; score: number } | null {
  let bestMatch: { name: string; score: number } | null = null
  
  for (const candidate of candidateNames) {
    const score = calculateSimilarity(queryVendor, candidate)
    if (score >= threshold && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { name: candidate, score }
    }
  }
  
  return bestMatch
}
