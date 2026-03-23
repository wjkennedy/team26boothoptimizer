console.log('=== ExpoFP Advanced API Debug ===\n')

async function fetchAndParse(url) {
  try {
    const response = await fetch(url)
    const text = await response.text()
    return { status: response.status, text }
  } catch (error) {
    return { error: error.message }
  }
}

async function main() {
  // 1. Fetch root HTML and extract embedded JSON config
  console.log('1. Fetching root HTML and extracting config...\n')
  const { status, text } = await fetchAndParse('https://team26.expofp.com/')
  
  if (text) {
    // Look for JSON in HTML comments
    const jsonMatch = text.match(/\/\*[\s\S]*?\{[\s\S]*?"config"[\s\S]*?\}[\s\S]*?\*\//) ||
                      text.match(/<!--[\s\S]*?\{[\s\S]*?"config"[\s\S]*?\}[\s\S]*?-->/)
    
    if (jsonMatch) {
      console.log('Found JSON config in HTML comments:')
      try {
        // Extract just the JSON part
        const jsonStr = jsonMatch[0]
          .replace(/^\/\*/, '')
          .replace(/\*\/$/, '')
          .replace(/^<!--/, '')
          .replace(/-->$/, '')
          .trim()
        const config = JSON.parse(jsonStr)
        console.log(JSON.stringify(config, null, 2))
        console.log('\n')
      } catch (e) {
        console.log('Could not parse config JSON:', e.message)
      }
    }
    
    // 2. Find data URLs in the HTML
    console.log('2. Looking for data endpoints...\n')
    const dataMatches = text.match(/["']\/data\/[^"']*["']/g) || []
    if (dataMatches.length > 0) {
      console.log('Found data references:')
      dataMatches.forEach(m => console.log('  -', m))
      console.log()
    }
    
    // 3. Try to fetch version.js
    console.log('3. Fetching version.js...\n')
    const versionResp = await fetchAndParse('https://team26.expofp.com/data/version.js')
    if (versionResp.text) {
      console.log('version.js (first 500 chars):')
      console.log(versionResp.text.substring(0, 500))
      console.log('\n')
    }
    
    // 4. Try common data endpoint patterns
    console.log('4. Testing common data endpoints...\n')
    const endpoints = [
      'https://team26.expofp.com/data/events.json',
      'https://team26.expofp.com/data/booths.json',
      'https://team26.expofp.com/api/booths',
      'https://team26.expofp.com/api/event/team26/booths',
      'https://team26.expofp.com/api/floorplans',
      'https://team26.expofp.com/data/floorplans.json',
    ]
    
    for (const endpoint of endpoints) {
      const resp = await fetchAndParse(endpoint)
      if (resp.status && resp.status < 400) {
        console.log(`✓ ${endpoint}`)
        console.log(`  Status: ${resp.status}`)
        console.log(`  Response (first 200 chars): ${resp.text?.substring(0, 200)}`)
      } else if (resp.status) {
        console.log(`✗ ${endpoint} - ${resp.status}`)
      } else {
        console.log(`✗ ${endpoint} - ${resp.error}`)
      }
    }
  }
}

main().catch(console.error)
