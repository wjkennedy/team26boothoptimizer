/**
 * Exhibitor metadata including descriptions for Team 26
 * Generated from normalized ExpoFP data
 * Maps exhibitor names to their descriptions
 */

export const exhibitorMetadata: Record<string, { description: string; boothIds: string[] }> = {
  "Community": {
    description: "Atlassian Community Hub - Connect with fellow users, share experiences, and learn from the community.",
    boothIds: ["100"]
  },
  "Braindate": {
    description: "One-on-one networking sessions connecting you with peers and experts.",
    boothIds: ["101"]
  },
  "Rewind": {
    description: "Session recordings and content replay for Team attendees.",
    boothIds: ["102"]
  },
  "theCUBE": {
    description: "Live interviews and discussions covering the latest in DevOps and IT operations.",
    boothIds: ["103"]
  },
  "Appfire": {
    description: "Marketplace apps and solutions for Atlassian products.",
    boothIds: ["104"]
  },
  "Smart Checklists by TitanApps": {
    description: "Smart checklists for Jira and Confluence enabling better task management.",
    boothIds: ["105"]
  },
  "Refined": {
    description: "Refined resource planning and project management solutions.",
    boothIds: ["107"]
  },
  "Adaptavist, part of The Adaptavist Group": {
    description: "Professional services and training from The Adaptavist Group.",
    boothIds: ["108"]
  },
  "ScriptRunner, part of The Adaptavist Group": {
    description: "Automation and scripting solutions for Atlassian products.",
    boothIds: ["109"]
  },
  "Kolekti, part of The Adaptavist Group": {
    description: "Enterprise content management and governance solutions.",
    boothIds: ["110"]
  },
  "Theater C": {
    description: "Main theater for keynotes and featured presentations.",
    boothIds: ["111"]
  },
  "eazyBI": {
    description: "Business intelligence and analytics for Jira and Confluence.",
    boothIds: ["112"]
  },
  "Atlassian Cafe": {
    description: "Food and beverage area - grab a coffee and relax.",
    boothIds: ["113"]
  },
  "catworkx": {
    description: "Cloud migration and DevOps solutions.",
    boothIds: ["114"]
  },
  "Atlassian Williams F1 Team": {
    description: "Experience the engineering behind elite motorsports.",
    boothIds: ["117"]
  },
  "Social Studio": {
    description: "Social media management and collaboration tools.",
    boothIds: ["118"]
  },
  "Atlassian Foundation": {
    description: "Learn about the Atlassian Community License Program and grant opportunities.",
    boothIds: ["200"]
  },
  "ActivityTimeline by Reliex": {
    description: "Activity timeline and audit trail solutions for Atlassian.",
    boothIds: ["201"]
  },
  "Professional Headshots": {
    description: "Get professional headshots taken at Team.",
    boothIds: ["218"]
  },
  "Isos Technology": {
    description: "Information technology solutions and consulting services.",
    boothIds: ["220"]
  },
  "Google Cloud": {
    description: "Google Cloud Platform solutions and services.",
    boothIds: ["221"]
  },
  "Cprime": {
    description: "Consulting and training services for agile and DevOps transformation.",
    boothIds: ["223"]
  },
};

/**
 * Get exhibitor description by name
 * Returns the description, or 'Details coming soon' if not found
 */
export function getExhibitorDescription(exhibitorName: string): string {
  const metadata = exhibitorMetadata[exhibitorName];
  return metadata?.description || 'Details coming soon';
}
