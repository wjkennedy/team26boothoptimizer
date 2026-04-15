#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');

async function main() {
  try {
    const dataPath = path.join(__dirname, 'team26.exhibitors.raw.json');
    
    console.log('[v0] Reading exhibitor data...');
    const rawData = await fs.readFile(dataPath, 'utf8');
    const exhibitors = JSON.parse(rawData);

    if (!Array.isArray(exhibitors)) {
      throw new Error('Invalid data structure: expected array');
    }

    console.log(`[v0] Loaded ${exhibitors.length} exhibitors`);

    // Build exhibitor map indexed by externalId
    const exhibitorMap = {};
    
    for (const exhibitor of exhibitors) {
      if (exhibitor.externalId) {
        exhibitorMap[exhibitor.externalId] = {
          name: exhibitor.name || exhibitor.externalId,
          description: exhibitor.description || '',
          logo: exhibitor.logo || null,
        };
      }
    }

    console.log(`[v0] Mapped ${Object.keys(exhibitorMap).length} exhibitors`);
    
    // Generate TypeScript file
    const projectRoot = path.resolve(__dirname, '..');
    const outputPath = path.join(projectRoot, 'lib', 'exhibitor-metadata.ts');
    
    const mapEntries = Object.entries(exhibitorMap)
      .map(([externalId, data]) => {
        const descEscaped = data.description
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n');
        
        return `  "${externalId}": {
    name: "${data.name.replace(/"/g, '\\"')}",
    description: "${descEscaped}",
    logo: ${data.logo ? `"${data.logo}"` : 'null'},
  }`;
      })
      .join(',\n');

    const content = `/**
 * Exhibitor metadata for Team 26
 * Includes names, descriptions, and logos
 * Generated from team26.exhibitors.raw.json
 */

export interface ExhibitorMetadata {
  name: string;
  description: string;
  logo: string | null;
}

export const exhibitorMetadata: Record<string, ExhibitorMetadata> = {
${mapEntries},
};

export function getExhibitorInfo(externalId: string): ExhibitorMetadata | undefined {
  return exhibitorMetadata[externalId];
}

export function getExhibitorLogo(externalId: string): string | null {
  const info = exhibitorMetadata[externalId];
  return info?.logo ?? null;
}

export function getExhibitorDescription(externalId: string): string {
  const info = exhibitorMetadata[externalId];
  return info?.description ?? '';
}
`;

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, content, 'utf8');

    console.log(`[v0] Generated ${outputPath}`);
    console.log(`[v0] ✓ Exhibitor metadata with logos ready!`);

  } catch (error) {
    console.error('[v0] Error generating exhibitor metadata:', error.message);
    process.exit(1);
  }
}

main();
