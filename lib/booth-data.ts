import { Booth } from '@/lib/distance-utils'

/**
 * Mock booth data from Team 26 floor plan
 * In production, this would be fetched from ExpoFP API
 */
export const mockBooths: Booth[] = [
  {
    id: 'A01',
    name: 'Atlassian',
    vendor: 'Atlassian',
    x: 50,
    y: 50,
    size: 'large',
  },
  {
    id: 'A02',
    name: 'AWS',
    vendor: 'Amazon Web Services',
    x: 150,
    y: 50,
    size: 'large',
  },
  {
    id: 'A03',
    name: 'Datadog',
    vendor: 'Datadog',
    x: 250,
    y: 50,
    size: 'medium',
  },
  {
    id: 'B01',
    name: 'Figma',
    vendor: 'Figma',
    x: 50,
    y: 150,
    size: 'medium',
  },
  {
    id: 'B02',
    name: 'GitHub',
    vendor: 'GitHub',
    x: 150,
    y: 150,
    size: 'large',
  },
  {
    id: 'B03',
    name: 'HashiCorp',
    vendor: 'HashiCorp',
    x: 250,
    y: 150,
    size: 'medium',
  },
  {
    id: 'C01',
    name: 'JFrog',
    vendor: 'JFrog',
    x: 50,
    y: 250,
    size: 'small',
  },
  {
    id: 'C02',
    name: 'LaunchDarkly',
    vendor: 'LaunchDarkly',
    x: 150,
    y: 250,
    size: 'small',
  },
  {
    id: 'C03',
    name: 'MongoDB',
    vendor: 'MongoDB',
    x: 250,
    y: 250,
    size: 'medium',
  },
  {
    id: 'D01',
    name: 'New Relic',
    vendor: 'New Relic',
    x: 50,
    y: 350,
    size: 'small',
  },
  {
    id: 'D02',
    name: 'PagerDuty',
    vendor: 'PagerDuty',
    x: 150,
    y: 350,
    size: 'small',
  },
  {
    id: 'D03',
    name: 'Snyk',
    vendor: 'Snyk',
    x: 250,
    y: 350,
    size: 'medium',
  },
]

/**
 * Fetch real booth data from ExpoFP API
 * Currently returns mock data - update to use actual API endpoint
 */
export async function getBoothsFromExpoFP(): Promise<Booth[]> {
  try {
    // TODO: Implement real ExpoFP API call
    // const response = await fetch('https://team26.expofp.com/api/booths')
    // const data = await response.json()
    // return transformExpoFPData(data)

    // Temporary: Return mock data
    return mockBooths
  } catch (error) {
    console.error('Failed to fetch booths from ExpoFP:', error)
    return mockBooths
  }
}

/**
 * Transform ExpoFP API response to our Booth interface
 * Placeholder for when real API is available
 */
function transformExpoFPData(data: any): Booth[] {
  // This function will parse ExpoFP response format
  return []
}
