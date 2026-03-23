import fetch from 'node-fetch'

async function debugExpoFPAPI() {
  console.log('[v0] Testing ExpoFP API endpoints...\n')

  // Try different API endpoints
  const endpoints = [
    'https://team26.expofp.com/api/v1/event',
    'https://team26.expofp.com/api/event',
    'https://team26.expofp.com/api/booths',
    'https://team26.expofp.com/api/v1/booths',
    'https://team26.expofp.com/data',
  ]

  for (const endpoint of endpoints) {
    try {
      console.log(`Trying: ${endpoint}`)
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
        },
      })

      console.log(`Status: ${response.status} ${response.statusText}`)

      if (response.ok) {
        const data = await response.json()
        console.log('Raw API Response:')
        console.log(JSON.stringify(data, null, 2))
      } else {
        const text = await response.text()
        console.log('Response:', text.substring(0, 500))
      }
    } catch (error) {
      console.log(`Error: ${(error as Error).message}`)
    }
    console.log('---\n')
  }

  // Also try to see if there's a public floor plan data endpoint
  console.log('Checking ExpoFP developer documentation...')
  const devDocs = 'https://developer.expofp.com'
  try {
    const response = await fetch(devDocs)
    console.log(`Developer docs status: ${response.status}`)
  } catch (error) {
    console.log(`Developer docs error: ${(error as Error).message}`)
  }
}

debugExpoFPAPI()
