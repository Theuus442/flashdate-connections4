#!/usr/bin/env npx ts-node
/**
 * Script to test the create-user-confirmed edge function
 * Run: npx ts-node test-edge-function.ts
 */

const SUPABASE_URL = 'https://kdwnptqxwnnzvdinhhin.supabase.co';
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/create-user-confirmed`;

async function testEdgeFunction() {
  console.log('🧪 Testing Edge Function...');
  console.log(`📍 Endpoint: ${FUNCTION_URL}`);
  console.log('');

  // Test 1: OPTIONS request (CORS preflight)
  console.log('Test 1: CORS Preflight (OPTIONS)');
  try {
    const optionsResponse = await fetch(FUNCTION_URL, {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    });
    console.log(`  Status: ${optionsResponse.status}`);
    console.log(`  Headers: ${JSON.stringify(Object.fromEntries(optionsResponse.headers))}`);
    console.log(`  ✅ CORS preflight: ${optionsResponse.status === 200 ? 'OK' : 'FAILED'}`);
  } catch (error) {
    console.log(`  ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
  }
  console.log('');

  // Test 2: POST request with test data
  console.log('Test 2: POST request with test credentials');
  try {
    const postResponse = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
      }),
    });
    console.log(`  Status: ${postResponse.status}`);
    
    const responseText = await postResponse.text();
    console.log(`  Response: ${responseText.substring(0, 200)}`);
    
    if (postResponse.ok) {
      const data = JSON.parse(responseText);
      console.log(`  ✅ User created: ${data.user?.id || 'N/A'}`);
    } else {
      console.log(`  ❌ Error response: ${responseText.substring(0, 100)}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
  }
  console.log('');
  console.log('Test completed!');
}

testEdgeFunction().catch(console.error);
