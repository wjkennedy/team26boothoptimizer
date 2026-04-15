#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');

async function main() {
  try {
    // The normalized JSON data is embedded in the file
    const normalizedDataPath = path.resolve(__dirname, '../user_read_only_context/text_attachments/team26.normalized-f3d0C.json');
    
    console.log('[v0] Reading normalized booth data...');
    const rawData = await fs.readFile(normalizedDataPath, 'utf8');
    const data = JSON.parse(rawData);

    if (!data.booths || !Array.isArray(data.booths)) {
      throw new Error('Invalid data structure: missing booths array');
    }

    // Build booth-to-vendor map
    const boothVendorMap = {};
    let mappedCount = 0;

    for (const booth of data.booths) {
      if (!booth.boothNumber) continue;
      
      // Use the first exhibitor name if available, otherwise skip
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
    
    const content = `// Auto-generated booth-to-vendor mapping from Team 26 normalized data
// Generated: ${new Date().toISOString()}
// Total booths mapped: ${mappedCount}

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
