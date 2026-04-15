#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');

async function main() {
  try {
    // Read the normalized JSON data from scripts folder (use absolute path)
    const dataPath = path.resolve('/vercel/share/v0-project/scripts', 'team26-normalized.json');
    
    console.log('[v0] Reading normalized booth data from:', dataPath);
    const rawData = await fs.readFile(dataPath, 'utf8');
    const data = JSON.parse(rawData);

    if (!data.booths || !Array.isArray(data.booths)) {
      throw new Error('Invalid data structure: missing booths array');
    }

    // Build booth-to-vendor map
    const boothVendorMap = {};
    let mappedCount = 0;

    for (const booth of data.booths) {
      if (!booth.boothNumber) continue;
      
      // Use the first exhibitor name if available
      if (booth.exhibitorNames && booth.exhibitorNames.length > 0) {
        boothVendorMap[booth.boothNumber] = booth.exhibitorNames[0];
        mappedCount++;
      }
    }

    console.log(`[v0] Mapped ${mappedCount} booths to vendor names`);
    console.log(`[v0] Sample mappings:`);
    Object.entries(boothVendorMap).slice(0, 5).forEach(([boothId, vendor]) => {
      console.log(`[v0]   Booth ${boothId} → ${vendor}`);
    });

    // Generate TypeScript file
    const projectRoot = path.resolve(__dirname, '..');
    const outputPath = path.join(projectRoot, 'lib', 'booth-vendor-map.ts');
    
    const content = `/**
 * Booth-to-vendor mapping for Team 26 expo floor
 * Auto-generated from normalized ExpoFP data
 * Maps ${mappedCount} booths to exhibitor/vendor names
 */

export const boothVendorMap: Record<string, string> = ${JSON.stringify(boothVendorMap, null, 2)};
`;

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, content, 'utf8');

    console.log(`[v0] Generated ${outputPath}`);
    console.log(`[v0] ✓ Booth vendor mapping ready!`);

  } catch (error) {
    console.error('[v0] Error generating booth vendor map:', error.message);
    process.exit(1);
  }
}

main();
