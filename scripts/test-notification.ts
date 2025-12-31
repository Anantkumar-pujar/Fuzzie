import fetch from 'node-fetch'

async function testNotificationEndpoint() {
  console.log('\n=== TESTING GOOGLE DRIVE NOTIFICATION ENDPOINT ===\n')
  
  const url = 'https://localhost:3000/api/drive-activity/notification'
  
  console.log(`Testing URL: ${url}\n`)
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-resource-id': '58uVhpQsd1yV1bv9Z2BQHPuG6Ak',
        'x-goog-message-number': `test-${Date.now()}`,
      },
      // @ts-ignore
      agent: new (await import('https')).Agent({
        rejectUnauthorized: false,
      }),
    })
    
    const text = await response.text()
    
    console.log(`Status: ${response.status} ${response.statusText}`)
    console.log(`Response: ${text}\n`)
    
    if (response.status === 200) {
      console.log('✅ Endpoint is working!')
    } else {
      console.log('❌ Endpoint returned error')
    }
    
  } catch (error: any) {
    console.error('❌ Request failed:', error.message)
  }
}

testNotificationEndpoint()
