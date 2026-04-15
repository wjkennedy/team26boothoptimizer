#!/usr/bin/env node
const fs = require('fs');

// Parse the normalized JSON embedded as a string since file read fails
const jsonStr = fs.readFileSync('/vercel/share/v0-project/lib/team26-raw-data.json', 'utf8');
const data = JSON.parse(jsonStr);

const map = {};
for (const booth of data.booths) {
  if (booth.boothNumber && booth.exhibitorNames && booth.exhibitorNames.length > 0) {
    map[booth.boothNumber] = booth.exhibitorNames[0];
  }
}

const output = `// Auto-generated booth-to-vendor mapping from Team 26 normalized data
// Generated: ${new Date().toISOString()}
// Total booths mapped: ${Object.keys(map).length}

export const boothVendorMap: Record<string, string> = ${JSON.stringify(map, null, 2)};
`;

fs.writeFileSync('/vercel/share/v0-project/lib/booth-vendor-map.ts', output);
console.log(`Generated booth-vendor-map.ts with ${Object.keys(map).length} mappings`);
