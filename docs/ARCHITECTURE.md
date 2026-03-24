# Team '26 Booth Optimizer - Architecture Guide

## Overview

The Booth Optimizer is a web application that helps attendees efficiently navigate Team 26 conference booths using optimized route planning combined with real-time floor plan visualization.

## Data Flow

```
ExpoFP Booths API
    ↓
ExpoFP Data Transform
(Filter vendor booths + calc positions)
    ↓
Booth Data State
    ↓
Route Optimization Strategies
(Serpentine, Big-to-Small, Quest)
    ↓
Waypoint IDs
    ↓
ExpoFP Wayfinding API (selectRoute)
    ↓
Interactive Floor Plan with Flowing Lines
```

## Key Components & APIs

### 1. ExpoFP Public Data API (Booth Data)

**Purpose**: Fetch all booths and floor plan coordinates for Team 26

**Endpoint**: `https://team26.expofp.com/data/booths.json`

**Response Format**:
```json
{
  "version": 1,
  "units": "feet",
  "booths": [
    {
      "level": { "name": "Main Floor", "index": 0 },
      "booths": [
        {
          "id": "2212",
          "rect": [x1, y1, x2, y2, x3, y3, x4, y4]
        }
      ]
    }
  ]
}
```

**Implementation**: `lib/booth-data.ts` → `getBoothsFromExpoFP()`

**Data Extraction**:
- Filter out non-vendor locations (Parking, Restrooms, Halls, etc.)
- Extract booth center: `x = (rect[0] + rect[2]) / 2`
- Calculate booth size based on area: `area = width × height`
- Preserve ExpoFP IDs for later wayfinding API calls

### 2. ExpoFP Wayfinding API (Interactive Routes)

**Purpose**: Display optimized routes with animated flowing lines and turn-by-turn directions

**Component**: `components/expofp-wayfinding.tsx`

**API Method**: `FloorPlan.selectRoute(waypointIds: string[])`

**How it works**:
1. Load ExpoFP JavaScript SDK: `https://www.expofp.com/build/expofp-js-api.js`
2. Initialize floor plan: `new ExpoFP.FloorPlan({ element, eventId: 'team26' })`
3. Pass ordered waypoint IDs: `floorPlan.selectRoute(['2212', '2213', '2216', ...])`
4. ExpoFP automatically calculates the optimized path and renders:
   - Real floor plan with venue context
   - Flowing animated lines between booths
   - Turn-by-turn directions
   - Distance estimates

**Waypoint Format**: Array of booth IDs as strings (max ~10 waypoints)

**Example**:
```javascript
const route = ['Event Check-In', '2212', '2213', '2216', '2220']
floorPlan.selectRoute(route)
```

### 3. Route Optimization Strategies

**Location**: `hooks/use-route-calculator.ts`

**Strategies**:

#### Serpentine Route
- Sweeps systematically through rows (left→right, right→left)
- Minimizes backtracking
- Best for steady, predictable coverage
- Implementation: Sorts booths by y-coordinate (row), alternates x-direction per row

#### Big-to-Small Route
- Prioritizes larger booths first (maximum swag potential)
- Fills gaps with smaller booths
- Uses basic nearest-neighbor optimization within each size tier

#### Quest Route (Coming Soon)
- Curated sequence: `QUEST_ROUTE_ORDER` in `lib/booth-data.ts`
- Recommended by Atlassian for prize eligibility
- Prize: Team 26 t-shirt

### 4. Atlassian Marketplace Integration (Ready for Implementation)

**Purpose**: Enrich booth data with vendor names, app details, and marketplace URLs

**Location**: `lib/atlassian-marketplace.ts`

**Endpoints**:

1. **Get App by Product ID**
   ```
   GET https://api.atlassian.com/marketplace/rest/3/product-listing/{productId}
   ```

2. **Get Apps by Developer ID**
   ```
   GET https://api.atlassian.com/marketplace/rest/3/product-listing/developer-space/{developerId}
   ```

**Response Schema**:
```typescript
interface MarketplaceApp {
  productId: string
  appKey: string
  appName: string
  summary: string
  category?: string
  images?: { iconFileId: string }
}
```

**Current Status**: Utility functions exist but booth data join is not yet wired. The `vendor` field in booths is empty and ready for enrichment.

## Extending the System

### To Add Marketplace Enrichment

1. Get booth IDs from ExpoFP API (already done)
2. Map booth IDs to Marketplace product IDs (requires booth-to-product mapping)
3. Call `getCachedMarketplaceApp(productId)` for each booth
4. Populate booth.vendor with marketplace data

```typescript
// Example enrichment function to add
export async function enrichBoothsWithMarketplace(
  booths: Booth[],
  boothToProductMap: Record<string, string>
): Promise<Booth[]> {
  return Promise.all(
    booths.map(async (booth) => {
      const productId = boothToProductMap[booth.id]
      if (!productId) return booth
      
      const app = await getCachedMarketplaceApp(productId)
      return {
        ...booth,
        vendor: app?.appName || booth.vendor,
      }
    })
  )
}
```

### To Customize Route Strategies

Edit `hooks/use-route-calculator.ts` → `calculateRoute()` function:

1. Add new strategy case to switch statement
2. Implement sorting/ordering logic
3. Return booth array in desired order
4. Component automatically handles wayfinding

### To Connect Different Event Data

Replace `team26` constants:

1. **Booth Data**: Update `EXPO_DATA_URL` in `lib/booth-data.ts`
2. **Floor Plan**: Change `eventId: 'team26'` in `components/expofp-wayfinding.tsx`
3. **Route Data**: Update `QUEST_ROUTE_ORDER` in `lib/booth-data.ts`

## Performance Considerations

- **Caching**: Marketplace data cached in `marketplaceCache` Map to avoid repeated API calls
- **Max Waypoints**: ExpoFP.selectRoute() works best with ~10 waypoints (max ~25)
- **Filtering**: Non-vendor locations filtered during ExpoFP data transform to reduce dataset
- **Client-Side Computation**: All route calculations happen in browser (no backend required)

## Open Standards & APIs Used

- **ExpoFP Public APIs**: No authentication required for public events
- **Atlassian Marketplace REST API v3**: Optional auth for higher rate limits
- **Fetch API**: Standard browser HTTP client
- **Canvas Context 2D**: Available for custom floor plan rendering if needed

## File Structure

```
/lib
  booth-data.ts          # ExpoFP data fetching & transformation
  atlassian-marketplace.ts  # Marketplace API helpers
  distance-utils.ts      # Booth types & routing utilities

/hooks
  use-route-calculator.ts # Route optimization strategies

/components
  expofp-wayfinding.tsx  # Floor plan & wayfinding UI
  booth-list.tsx         # Ordered booth sequence display
  strategy-toggle.tsx    # Strategy selection

/app
  booth-optimizer/page.tsx  # Main orchestration page
```
