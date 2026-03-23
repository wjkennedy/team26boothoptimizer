const https = require('https');
const http = require('http');

async function testExpoFPAPI() {
  console.log('=== ExpoFP API Debug ===\n');

  // Test different potential API endpoints
  const endpoints = [
    'https://team26.expofp.com',
    'https://team26.expofp.com/api/v1/event',
    'https://developer.expofp.com/api/event',
    'https://api.expofp.com/event/team26',
    'https://www.expofp.com/api/event/team26',
  ];

  for (const endpoint of endpoints) {
    console.log(`Testing: ${endpoint}`);
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Team26BoothOptimizer/1.0',
        },
        timeout: 5000,
      });

      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);

      const text = await response.text();
      if (text.length > 0) {
        try {
          const json = JSON.parse(text);
          console.log('Response (first 500 chars):');
          console.log(JSON.stringify(json, null, 2).substring(0, 500));
        } catch (e) {
          console.log('Response (HTML/Text, first 300 chars):');
          console.log(text.substring(0, 300));
        }
      }
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
    console.log('---\n');
  }

  // Try to detect if there's a public API pattern from team26.expofp.com
  console.log('Testing team26.expofp.com root:');
  try {
    const response = await fetch('https://team26.expofp.com/', {
      headers: { 'Accept': 'application/json' },
    });
    const html = await response.text();
    
    // Look for any API references in the HTML
    const apiMatches = html.match(/api[^"<>]{0,100}/gi);
    const eventMatches = html.match(/event[ID="']{1,2}[^"'<>]{0,50}/gi);
    
    console.log('API references found in HTML:');
    if (apiMatches) console.log(apiMatches.slice(0, 5));
    
    console.log('\nEvent references found in HTML:');
    if (eventMatches) console.log(eventMatches.slice(0, 5));

    // Look for script tags that might have data
    const scriptMatches = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi);
    if (scriptMatches) {
      console.log(`\nFound ${scriptMatches.length} script tags`);
      scriptMatches.slice(0, 2).forEach((script, i) => {
        console.log(`Script ${i + 1} (first 300 chars):`);
        console.log(script.substring(0, 300));
      });
    }
  } catch (err) {
    console.log(`Error fetching root: ${err.message}`);
  }

  console.log('\n=== Summary ===');
  console.log('We need to:');
  console.log('1. Find the correct ExpoFP API endpoint for Team 26');
  console.log('2. Determine if authentication/API key is required');
  console.log('3. Get the event ID or identifier from team26.expofp.com');
}

testExpoFPAPI().catch(err => console.error('Fatal error:', err));
