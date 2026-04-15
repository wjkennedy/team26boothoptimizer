#!/usr/bin/env node

const { writeFile, mkdir } = require('node:fs/promises');
const path = require('node:path');

// Use process.cwd() for the project root since require.main.filename may be undefined
const projectRoot = process.cwd();

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
    const eventData = await fetchJson('https://team26.expofp.com/data/data.json').catch(() => null);

    let boothVendorMap = {};
    
    if (eventData && Array.isArray(eventData.exhibitors)) {
      console.log(`[v0] Loaded ${eventData.exhibitors.length} exhibitors`);
      
      // Try to extract booth IDs from exhibitor data
      // Some ExpoFP setups store booth references in custom fields or the exhibitor object
      for (const exhibitor of eventData.exhibitors) {
        console.log(`[v0] Exhibitor: ${exhibitor.name} (ID: ${exhibitor.id}, externalId: ${exhibitor.externalId})`);
        
        // Check various possible booth reference fields
        if (exhibitor.booth || exhibitor.boothId || exhibitor.booth_id) {
          const boothId = exhibitor.booth || exhibitor.boothId || exhibitor.booth_id;
          if (boothId) {
            boothVendorMap[boothId] = exhibitor.name;
            console.log(`[v0] Mapped booth ${boothId} to ${exhibitor.name}`);
          }
        }
        
        // Check for array of booths
        if (Array.isArray(exhibitor.booths)) {
          for (const boothId of exhibitor.booths) {
            boothVendorMap[boothId] = exhibitor.name;
            console.log(`[v0] Mapped booth ${boothId} to ${exhibitor.name}`);
          }
        }
      }
    }

    const mappedCount = Object.keys(boothVendorMap).length;
    console.log(`[v0] Total booths mapped: ${mappedCount}`);

    // Generate TypeScript file
    const outputPath = path.join(projectRoot, 'lib', 'booth-vendor-map.ts');
    const content = `// Auto-generated booth-to-vendor mapping from ExpoFP data
// Generated: ${new Date().toISOString()}
// Manual entries can be added below and will be preserved on regeneration

export const boothVendorMap: Record<string, string> = ${JSON.stringify(boothVendorMap, null, 2)};
`;

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, content, 'utf8');

    console.log(`[v0] Generated ${outputPath}`);

  } catch (error) {
    console.error('[v0] Error generating booth vendor map:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
