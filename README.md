# Team 26 Booth Optimizer

> Attend Summit with intention. Prioritize the vendors that matter to you. Minimize the foam.

## Why This Exists

Summit is a lot. Between keynotes, breakouts, hands-on labs, networking, swag, quests, raffles, and feedback sessions—there's an invisible tax on your time and attention. Add in the geography of the expo floor, and suddenly you're walking 10,000 steps when you could've walked 3,000.

This tool respects your summit attendance.

By linking Atlassian Marketplace data with real booth locations, you can:
- **Discover vendors** in the categories that matter to you (no keyword guessing)
- **Build a route** that honors your geography and time constraints
- **Prioritize strategically** rather than reactively wandering

Whether you're flying in or driving down the road, whether this is your first Summit or your tenth, this tool helps you get what you came for—and maybe find something unexpected along the way.

---

## Features

### Marketplace Discovery
- **Live Marketplace data**: Browse ~5,000 Atlassian Marketplace apps across all categories
- **Smart filtering**: Select by category, then vendor, then search within results
- **Rich metadata**: Ratings, install counts, verification status at a glance
- **Vendor-to-booth matching**: See which booths align with your favorite vendors

### Route Optimization
- **Interactive floor plan**: Click booths to add them to your route
- **Auto-optimized paths**: Traveling Salesman Problem solver minimizes total distance
- **Layer controls**: Toggle between full map, route-only, or map-only views
- **Export & share**: Download your route as a high-res PNG for offline reference

### Integration
- **ExpoFP API**: Real-time booth coordinates and metadata
- **Atlassian Marketplace API**: All vendor and app data fetched live (no stale data)

---

## For Summit Attendees

1. Open the tool
2. Browse **Marketplace** to find vendors and apps that align with your interests
3. Click **"Add to route"** for any booth that matters to you
4. Review your route on the **Floor Plan**
5. Use layer controls to focus on just your stops, or see the full context
6. Export your route and go discover

---

## For Developers (in v0)

### Running Locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000/booth-optimizer.

### Project Structure

```
/lib
  ├── marketplace-api.ts        # Atlassian Marketplace API client
  ├── marketplace-types.ts      # Type definitions
  ├── expofp.ts                 # ExpoFP booth data client
  ├── distance-utils.ts         # TSP solver & routing logic
  └── booth-data.ts             # Booth loading & cache

/components
  ├── marketplace-browser.tsx    # Category → Vendor → Search UI
  ├── expofp-wayfinding.tsx      # Canvas-based floor plan
  ├── route-optimizer.tsx        # TSP algorithm + route mgmt
  └── ...

/app/booth-optimizer
  └── page.tsx                   # Main page (RSC)
```

### Key Concepts

**Marketplace Browser**  
Prefetches all ~5,000 cloud-hosted apps on mount (`fetchAllMarketplaceApps`). Extracts unique categories and vendors, then provides hierarchical filtering:
- Select category → see vendors in that category
- Select vendor → see apps from that vendor
- Search within filtered results → local fuzzy matching

When a booth has a vendor name that matches a Marketplace vendor, the "Add to route" button activates.

**Floor Plan Canvas**  
Uses HTML5 Canvas to render booths and route overlays. Layer modes control visibility:
- `combined`: All booths + route badges + dashed path
- `route-only`: Only booths in your route
- `map-only`: All booths, no route chrome

**Routing Engine**  
Implements a nearest-neighbor heuristic with 2-opt optimization (in `distance-utils.ts`). Given a set of waypoints, it minimizes total walking distance.

### Editing in v0

- **Components**: Modify `/components` files to change UI
- **API clients**: Marketplace and ExpoFP calls live in `/lib`
- **Styling**: Tailwind CSS (see globals.css for design tokens)
- **Routing logic**: `distance-utils.ts` contains the TSP solver

Changes auto-save and hot-reload in the preview.

### Data Flow

1. **On load**: ExpoFP booths fetched → stored in state
2. **Marketplace browser opens**: `fetchAllMarketplaceApps` called → categories/vendors extracted
3. **User selects booth(s)**: Booth IDs added to `waypointIds`
4. **Route optimizer runs**: TSP solver calculates shortest path
5. **Canvas redraws**: Floor plan shows route with numbered stops

---

## Notes for Contributors

- **Booth vendor data**: Currently populated from ExpoFP. When vendor names are available, booth-to-marketplace matching will activate automatically.
- **Real-time data**: Both Marketplace and ExpoFP data are fetched live on each session. No caching between sessions.
- **Canvas rendering**: DPI-aware and responsive. Zoom works naturally; export uses 2× resolution.
- **Performance**: With ~5,000 apps and ~200 booths, filtering and rendering are instant. The Marketplace prefetch takes 10–20 seconds on first load.

---

## Philosophy

Summit is a sprint. You'll never hit everything. That's okay.

This tool helps you *choose* instead of *wander*. It respects your time, your energy, and your distance. Whether you want to deep-dive into one vendor's ecosystem or sample from five categories, the route is yours.

And if you find something unexpected—a breakout that changes everything, a vendor you never knew you needed—that's the magic of in-person tech events. The tool gets you there efficiently. The rest is up to you.

---

## Continue Working in v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below — start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_0SUmZpgdZ7h3qigdIdKWAds036Ih)

---

Have a great Summit!
