#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');
const readline = require('node:readline');

async function parseJSON(filePath) {
  const rawData = await fs.readFile(filePath, 'utf8');
  return JSON.parse(rawData);
}

async function main() {
  try {
    const dataPath = '/vercel/share/v0-project/scripts/team26.exhibitors.raw.json';
    
    console.log('[v0] Reading exhibitor data...');
    const exhibitors = await parseJSON(dataPath);

    // Build exhibitor metadata with full logo URLs
    const metadata = {};
    let logoCount = 0;

    for (const exhibitor of exhibitors) {
      if (!exhibitor.externalId) continue;

      const logoPath = exhibitor.logo ? `https://team26.expofp.com/data/${exhibitor.logo}` : null;
      
      metadata[exhibitor.externalId] = {
        name: exhibitor.name,
        description: exhibitor.description || 'Details coming soon',
        logo: logoPath,
      };

      if (exhibitor.logo) logoCount++;
    }

    console.log(`[v0] Processed ${exhibitors.length} exhibitors`);
    console.log(`[v0] Found ${logoCount} logos`);

    // Generate TypeScript file
    const projectRoot = '/vercel/share/v0-project';
    const outputPath = path.join(projectRoot, 'lib', 'exhibitor-metadata.ts');
    
    // Build the metadata object as TypeScript code
    const entries = Object.entries(metadata)
      .map(([externalId, data]) => {
        const escapedName = data.name.replace(/"/g, '\\"');
        const escapedDesc = data.description.replace(/"/g, '\\"').replace(/\n/g, '\\n');
        const logoLine = data.logo 
          ? `    logo: "${data.logo}",`
          : `    logo: null,`;
        
        return `  "${externalId}": {
    name: "${escapedName}",
    description: "${escapedDesc}",
${logoLine}
  }`;
      });

    const content = `/**
 * Exhibitor metadata including descriptions and logos for Team 26
 * Generated from team26.exhibitors.raw.json
 * Maps exhibitor external IDs to their names, descriptions, and logo URLs
 */

export interface ExhibitorMetadata {
  name: string;
  description: string;
  logo: string | null;
}

export const exhibitorMetadata: Record<string, ExhibitorMetadata> = {
${entries.join(',\n')},
};

/**
 * Get exhibitor metadata by external ID
 */
export function getExhibitorInfo(externalId: string): ExhibitorMetadata | undefined {
  return exhibitorMetadata[externalId];
}

/**
 * Get exhibitor logo URL by external ID
 */
export function getExhibitorLogo(externalId: string): string | null {
  const info = exhibitorMetadata[externalId];
  return info?.logo ?? null;
}

/**
 * Get exhibitor description by external ID
 * Returns the description, or 'Details coming soon' if not found
 */
export function getExhibitorDescription(externalId: string): string {
  const info = exhibitorMetadata[externalId];
  return info?.description || 'Details coming soon';
}
`;

    await fs.writeFile(outputPath, content, 'utf8');
    console.log(`[v0] Generated ${outputPath}`);
    console.log(`[v0] ✓ Exhibitor metadata complete!`);

  } catch (error) {
    console.error('[v0] Error:', error.message);
    process.exit(1);
  }
}

main();
