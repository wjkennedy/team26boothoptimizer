#!/usr/bin/env node

const { writeFile, mkdir } = require('node:fs/promises');
const path = require('node:path');

const __dirname = path.dirname(require.main.filename);
const projectRoot = path.resolve(__dirname, '..');

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

async function main() {
  console.log('[v0] Fetching ExpoFP data for Team 26...');

  try {
    // Fetch booths and full event data
    const [boothsData, eventData] = await Promise.all([
      fetchJson('https://team26.expofp.com/data/booths.json'),
      fetchJson('https://team26.expofp.com/data/data.json').catch(() => null),
    ]);

    // Flatten booths array if it's nested
    let allBooths = [];
    if (Array.isArray(boothsData)) {
      allBooths = boothsData;
    } else if (boothsData && Array.isArray(boothsData.booths)) {
      // Handle nested structure from booths.json
      for (const level of boothsData.booths) {
        if (Array.isArray(level.booths)) {
          allBooths = allBooths.concat(level.booths);
        }
      }
    }

    console.log(`[v0] Loaded ${allBooths.length} booths`);

    let exhibitorsData = [];
    if (eventData && Array.isArray(eventData.exhibitors)) {
      exhibitorsData = eventData.exhibitors;
      console.log(`[v0] Loaded ${exhibitorsData.length} exhibitors from data.json`);
    }

    // Build booth-to-vendor map
    const boothVendorMap = {};

    if (exhibitorsData.length > 0) {
      // If exhibitors data is available, map booths to exhibitor names
      for (const booth of allBooths) {
        if (!booth.id || typeof booth.id !== 'string') continue;

        // Skip non-booth entries
        if (booth.id.includes('Parking') || booth.id.includes('Hotel') ||
            booth.id.includes('Hall D') || booth.id.includes('Bash') ||
            booth.id.includes('Arena')) {
          continue;
        }

        // Find exhibitors for this booth
        if (Array.isArray(booth.exhibitors) && booth.exhibitors.length > 0) {
          const exhibitorIds = booth.exhibitors.map(id => Number(id));
          const matchingExhibitors = exhibitorsData.filter(ex =>
            exhibitorIds.includes(Number(ex.id))
          );

          if (matchingExhibitors.length > 0) {
            // Use the first exhibitor name as the vendor
            boothVendorMap[booth.id] = matchingExhibitors[0].name;
          }
        }
      }
    } else {
      console.warn('[v0] No exhibitor data in data.json');
    }

    const mappedCount = Object.keys(boothVendorMap).length;
    console.log(`[v0] Mapped ${mappedCount} booths to vendor names`);

    // Generate TypeScript file
    const outputPath = path.join(projectRoot, 'lib', 'booth-vendor-map.ts');
    const content = `// Auto-generated booth-to-vendor mapping from ExpoFP data
// Generated: ${new Date().toISOString()}

export const boothVendorMap: Record<string, string> = ${JSON.stringify(boothVendorMap, null, 2)};
`;

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, content, 'utf8');

    console.log(`[v0] Generated ${outputPath}`);
    console.log(`[v0] Total vendors mapped: ${mappedCount}`);

  } catch (error) {
    console.error('[v0] Error generating booth vendor map:', error.message);
    process.exit(1);
  }
}

main();
