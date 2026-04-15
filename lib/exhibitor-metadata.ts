/**
 * Exhibitor metadata including descriptions and logos for Team 26
 * Generated from team26.exhibitors.raw.json
 * Maps exhibitor external IDs to their names, descriptions, and logos
 */

export interface ExhibitorMetadata {
  name: string;
  description: string;
  logo: string | null;
}

// Base URL for exhibitor logos
const EXHIBITOR_BASE_URL = 'https://team26.expofp.com/data/';

export const exhibitorMetadata: Record<string, ExhibitorMetadata> = {
  "Community": {
    name: "Community",
    description: "Learn, connect, and grow with the Atlassian Community.",
    logo: null
  },
  "Braindate": {
    name: "Braindate",
    description: "One-on-one networking sessions connecting you with peers and experts.",
    logo: null
  },
  "Rewind": {
    name: "Rewind",
    description: "Session recordings and content replay for Team attendees.",
    logo: null
  },
  "theCUBE": {
    name: "theCUBE",
    description: "Live interviews and discussions covering the latest in DevOps and IT operations.",
    logo: null
  },
  "Appfire": {
    name: "Appfire",
    description: "At Appfire, we believe work should move forward with purpose. For more than two decades, we have proven that extending and connecting the world's leading platforms unlocks new levels of productivity across DevOps, Software Engineering, and Service Management teams.",
    logo: "exhibitors/14263387/media/appfire.webp"
  },
  "Smart Checklists by TitanApps": {
    name: "Smart Checklists by TitanApps",
    description: "Smart checklists for Jira and Confluence enabling better task management.",
    logo: null
  },
  "Refined": {
    name: "Refined",
    description: "Refined resource planning and project management solutions.",
    logo: null
  },
  "Adaptavist, part of The Adaptavist Group": {
    name: "Adaptavist, part of The Adaptavist Group",
    description: "Adaptavist is a global technology and innovative solutions provider founded in 2005, helping organisations boost agility and overcome the challenges of digital transformation.",
    logo: "exhibitors/14263384/media/adaptavist-part-of-the-adaptavist-group.webp"
  },
  "ScriptRunner, part of The Adaptavist Group": {
    name: "ScriptRunner, part of The Adaptavist Group",
    description: "Automation and scripting solutions for Atlassian products.",
    logo: null
  },
  "Kolekti, part of The Adaptavist Group": {
    name: "Kolekti, part of The Adaptavist Group",
    description: "Enterprise content management and governance solutions.",
    logo: null
  },
  "Theater C": {
    name: "Theater C",
    description: "Main theater for keynotes and featured presentations.",
    logo: null
  },
  "eazyBI": {
    name: "eazyBI",
    description: "Business intelligence and analytics for Jira and Confluence.",
    logo: null
  },
  "Atlassian Cafe": {
    name: "Atlassian Cafe",
    description: "Food and beverage area - grab a coffee and relax.",
    logo: null
  },
  "catworkx": {
    name: "catworkx",
    description: "catworkx is a 100% Atlassian-dedicated Platinum Solution Partner, recognized as Atlassian Partner of the Year 2024–2025: High Velocity Service Management.",
    logo: "exhibitors/14263391/media/catworkx.webp"
  },
  "Atlassian Williams F1 Team": {
    name: "Atlassian Williams F1 Team",
    description: "As the Official Title and Technology Partner of Atlassian Williams Racing, Atlassian is helping transform how one of the world's most iconic teams works.",
    logo: null
  },
  "Social Studio": {
    name: "Social Studio",
    description: "Social media management and collaboration tools.",
    logo: null
  },
  "Atlassian Foundation": {
    name: "Atlassian Foundation",
    description: "Help teams grow from idea to impact at the Atlassian Foundation booth. Direct Kiva.org micro-loans to social enterprise teams.",
    logo: null
  },
  "ActivityTimeline by Reliex": {
    name: "ActivityTimeline by Reliex",
    description: "ActivityTimeline is a comprehensive resource planning and time tracking application built for Jira. We provide apps that extend the capabilities of Jira, helping teams visualize project timelines, manage resources effectively, and track time with precision.",
    logo: "exhibitors/14263383/media/activitytimeline-by-reliex.webp"
  },
  "Professional Headshots": {
    name: "Professional Headshots",
    description: "Get professional headshots taken at Team.",
    logo: null
  },
  "Isos Technology": {
    name: "Isos Technology",
    description: "Information technology solutions and consulting services.",
    logo: null
  },
  "Google Cloud": {
    name: "Google Cloud",
    description: "Google Cloud Platform solutions and services.",
    logo: null
  },
  "Cprime": {
    name: "Cprime",
    description: "Cprime helps organizations succeed after Atlassian Cloud migration. With over 12 years of Atlassian expertise and hundreds of Cloud migrations delivered, we partner with leaders and teams to turn Cloud into a platform for sustained value.",
    logo: "exhibitors/14263394/media/cprime.webp"
  },
};

/**
 * Get exhibitor metadata by external ID
 */
export function getExhibitorInfo(externalId: string): ExhibitorMetadata | undefined {
  return exhibitorMetadata[externalId];
}

/**
 * Get exhibitor logo URL by external ID with cache-busting version parameter
 * Constructs full URL: https://team26.expofp.com/data/{logo}?v={version}
 */
export function getExhibitorLogoUrl(externalId: string, version?: string): string | null {
  const info = exhibitorMetadata[externalId];
  if (!info?.logo) return null;
  
  // If no version provided, use current timestamp as version
  const v = version || Math.floor(Date.now() / 1000).toString();
  return `${EXHIBITOR_BASE_URL}${info.logo}?v=${v}`;
}

/**
 * Get exhibitor logo path without version parameter
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
