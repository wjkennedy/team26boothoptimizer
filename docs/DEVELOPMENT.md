# Development Guide - How to Extend Booth Optimizer

## Quick Start for Developers

### Understanding the Data Join

The Booth Optimizer currently pulls data from two sources:

1. **ExpoFP** - Provides booth coordinates and floor plan layout
2. **Atlassian Marketplace** (optional) - Provides vendor app details

Currently, the join is **not implemented**. Booths have an empty `vendor` field ready for enrichment.

### Connecting Marketplace Data

To add vendor names from Atlassian Marketplace:

**Step 1**: Create a booth ID to Marketplace Product ID mapping

```typescript
// lib/booth-to-product-map.ts (new file)
export const BOOTH_PRODUCT_MAP: Record<string, string> = {
  '2212': 'jira',           // Product ID in Atlassian Marketplace
  '2213': 'confluence',
  '2216': 'bitbucket',
  // ... add mapping for each booth
}
```

**Step 2**: Add enrichment hook in `app/booth-optimizer/page.tsx`

```typescript
import { getCachedMarketplaceApp } from '@/lib/atlassian-marketplace'
import { BOOTH_PRODUCT_MAP } from '@/lib/booth-to-product-map'

// In your useEffect after booths load:
useEffect(() => {
  const enrichBooths = async () => {
    const enriched = await Promise.all(
      booths.map(async (booth) => {
        const productId = BOOTH_PRODUCT_MAP[booth.id]
        if (productId) {
          const app = await getCachedMarketplaceApp(productId)
          return { ...booth, vendor: app?.appName }
        }
        return booth
      })
    )
    setBooths(enriched)
  }
  
  if (booths.length > 0) enrichBooths()
}, [booths])
```

**Step 3**: Display vendor details in booth list

Already working! The `booth-list.tsx` component shows the vendor name if available.

## Customizing Route Strategies

### Adding a New Strategy

**File**: `hooks/use-route-calculator.ts`

**Steps**:

1. Add strategy type to union:
```typescript
type Strategy = 'serpentine' | 'big-to-small' | 'quest' | 'my-custom-strategy'
```

2. Implement sorting logic in `calculateRoute()`:
```typescript
case 'my-custom-strategy': {
  sortedBooths = booths.sort((a, b) => {
    // Your custom logic here
    // e.g., sort by vendor name, category, booth size, etc.
    return a.vendor.localeCompare(b.vendor)
  })
  break
}
```

3. Add UI toggle in `strategy-toggle.tsx`

4. Add description in `booth-optimizer/page.tsx`

### Common Customizations

**Sort by Vendor Category**:
```typescript
sortedBooths = booths.sort((a, b) => 
  (a.category || '').localeCompare(b.category || '')
)
```

**Sort by Booth Number (ascending)**:
```typescript
sortedBooths = booths.sort((a, b) => 
  parseInt(a.id) - parseInt(b.id)
)
```

**Sort by Distance from Entry Point**:
```typescript
const entry = booths.find(b => b.id === 'Event Check-In')
sortedBooths = booths.sort((a, b) => {
  const distA = Math.hypot(a.x - entry!.x, a.y - entry!.y)
  const distB = Math.hypot(b.x - entry!.x, b.y - entry!.y)
  return distA - distB
})
```

## Adapting for Different Events

### Switch to a Different ExpoFP Event

**File**: `lib/booth-data.ts`

```typescript
// Change this:
const EXPO_DATA_URL = 'https://team26.expofp.com/data/booths.json'

// To your event:
const EXPO_DATA_URL = 'https://your-event.expofp.com/data/booths.json'
```

**File**: `components/expofp-wayfinding.tsx`

```typescript
// Change this:
eventId: 'team26'

// To your event ID:
eventId: 'your-event-id'
```

### Finding Your ExpoFP Event ID

1. Go to your ExpoFP floor plan in a browser
2. Open DevTools → Network tab
3. Look for requests to `https://your-event.expofp.com`
4. The subdomain (before `.expofp.com`) is your `eventId`

## API Reference

### ExpoFP Booth Data API

```typescript
// Get all booths for your event
fetch('https://your-event.expofp.com/data/booths.json')
  .then(r => r.json())
  .then(data => {
    // data.booths = array of floors with booths
    // each booth has: { id, rect: [x1, y1, x2, y2, x3, y3, x4, y4] }
  })
```

### ExpoFP Wayfinding SDK

```javascript
// 1. Load SDK
const script = document.createElement('script')
script.src = 'https://www.expofp.com/build/expofp-js-api.js'
document.body.appendChild(script)

script.onload = () => {
  // 2. Initialize floor plan
  const floorPlan = new ExpoFP.FloorPlan({
    element: containerDiv,
    eventId: 'your-event-id'
  })

  // 3. Set route
  floorPlan.selectRoute(['booth1', 'booth2', 'booth3'])
}
```

### Atlassian Marketplace API

```typescript
// Get app by product ID
import { getCachedMarketplaceApp } from '@/lib/atlassian-marketplace'

const app = await getCachedMarketplaceApp('jira')
console.log(app?.appName)     // "Jira"
console.log(app?.appKey)      // "jira:jira"
console.log(app?.summary)     // "The #1 software..."
console.log(app?.category)    // "Project Management"
```

**Optional**: Provide Atlassian credentials for higher rate limits

```typescript
const app = await getCachedMarketplaceApp('jira', {
  email: 'your-email@example.com',
  token: 'your-atlassian-token'
})
```

Generate token: https://id.atlassian.com/manage-profile/security/api-tokens

## Debugging Tips

### Check Booth Data Loading
```typescript
console.log('[v0] Fetched booths:', booths.length)
console.log('[v0] Booth IDs:', booths.map(b => b.id))
```

### Check Route Generation
```typescript
console.log('[v0] Route:', route.route.map(s => s.booth.id))
console.log('[v0] Total booths:', route.totalBooths)
```

### Check Floor Plan Initialization
```javascript
// In browser console
if (window.__team26FloorPlan) {
  console.log('Floor plan loaded:', window.__team26FloorPlan)
  window.__team26FloorPlan.selectRoute(['2212', '2213'])
}
```

### Check Marketplace Enrichment
```typescript
import { getCachedMarketplaceApp } from '@/lib/atlassian-marketplace'

// Test in browser console
await getCachedMarketplaceApp('jira').then(console.log)
```

## Common Issues

### Floor Plan Shows Blank White Rectangle

**Causes**:
- ExpoFP SDK failed to load (check network tab)
- Event ID is wrong
- CORS issue with ExpoFP API

**Solution**:
- Check browser console for errors
- Verify event ID is correct
- Check ExpoFP API is accessible: `https://www.expofp.com/build/expofp-js-api.js`

### Booth Vendor Names Show "TBD"

**Cause**: Marketplace enrichment not wired

**Solution**: Follow "Connecting Marketplace Data" section above

### Route Not Showing on Floor Plan

**Cause**: Waypoint IDs don't match ExpoFP booth IDs

**Solution**:
- Log booth IDs: `console.log(booths.map(b => b.externalId))`
- Verify they match ExpoFP response IDs
- Check max 10 waypoints limit

## Resources

- [ExpoFP Developer Guide](https://developer.expofp.com)
- [ExpoFP Wayfinding Guide](https://developer.expofp.com/guide/wayfinding-guide)
- [Atlassian Marketplace REST API](https://developer.atlassian.com/platform/marketplace/rest/v4/)
- [Next.js 16 Documentation](https://nextjs.org/docs)
