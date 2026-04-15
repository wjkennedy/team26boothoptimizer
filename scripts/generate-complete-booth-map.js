#!/usr/bin/env node

/**
 * Generate comprehensive booth-to-vendor mapping from booths CSV
 * Booth IDs map to exhibitor names for marketplace matching
 */

const fs = require('node:fs/promises');
const path = require('node:path');

// CSV data for booths (parsed inline)
const bootsData = `boothNumber,exhibitorNames
100,Community
101,Braindate
102,Rewind
103,theCUBE
104,Appfire
105,Smart Checklists by TitanApps
107,Refined
108,Adaptavist, part of The Adaptavist Group
109,ScriptRunner, part of The Adaptavist Group
110,Kolekti, part of The Adaptavist Group
111,Theater C
112,eazyBI
113,Atlassian Cafe
114,catworkx
117,Atlassian Williams F1 Team
118,Social Studio
200,Atlassian Foundation
201,ActivityTimeline by Reliex
218,Professional Headshots
220,Isos Technology
221,Google Cloud
223,Cprime
225,Welcome Booth
226,Accenture
227,Sponsor Highlights Lounge
228,Seibert Group
229,Atlasstian for Startups
231,K15t
232,Elevatic
233,Ventures
234,Oxalis Solutions
235,Team Talk Studio
300,Theater B
301,Theater A
312,Creativas FZCO
313,GitProtect by Xopero Software
314,Eficode
315,Decadis AG
316,Mumo Systems
317,Nagarro
318,Exalate
319,BrowserStack Inc.
321,Modus Create
322,Lansweeper
326,ServiceRocket
327,Clovity
328,Atlassian Cafe
329,Amazon Web Services
330,Empyra
331,Caelor
332,codefortynine
333,ACCELQ
336,Praecipio
337,Deviniti
338,e-Core
339,ikuTeam
340,Ricksoft, Inc.
341,re:solution
342,knowmad mood
343,55 Degrees AB
344,Nimble Evolution
345,ANB Technologies LLC
346,TechTime Initiative Group|Tempo.io
347,Research Workshop
348,Impact Makers
350,Xray
351,Trundl
352,Customer Signals and Insights (CSI)
353,yasoon GmbH
354,Perforce Gliffy
401,Advisory Services`;

async function main() {
  try {
    const boothVendorMap = {};
    
    // Parse booth data
    const lines = bootsData.trim().split('\n').slice(1); // Skip header
    for (const line of lines) {
      const [boothNumber, exhibitorNames] = line.split(',');
      if (boothNumber && exhibitorNames) {
        // Use first exhibitor if multiple are listed
        const primaryExhibitor = exhibitorNames.split('|')[0].trim();
        boothVendorMap[boothNumber] = primaryExhibitor;
      }
    }

    console.log(`[v0] Mapped ${Object.keys(boothVendorMap).length} booths to vendor names`);
    console.log(`[v0] Sample mappings:`);
    Object.entries(boothVendorMap).slice(0, 10).forEach(([boothId, vendor]) => {
      console.log(`[v0]   Booth ${boothId} → ${vendor}`);
    });

    // Generate TypeScript file
    const projectRoot = process.cwd();
    const outputPath = path.join(projectRoot, 'lib', 'booth-vendor-map.ts');
    
    const content = `/**
 * Comprehensive booth-to-vendor mapping for Team 26 expo floor
 * Generated from booths.csv with ${Object.keys(boothVendorMap).length} booth-to-exhibitor mappings
 * Used for marketplace vendor matching and route building
 */

export const boothVendorMap: Record<string, string> = ${JSON.stringify(boothVendorMap, null, 2)};
`;

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, content, 'utf8');

    console.log(`[v0] Generated ${outputPath}`);
    console.log(`[v0] ✓ Comprehensive booth vendor mapping complete!`);

  } catch (error) {
    console.error('[v0] Error generating booth vendor map:', error.message);
    process.exit(1);
  }
}

main();
