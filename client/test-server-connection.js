// Test script for checking server connectivity
const axios = require('axios');

async function testServerConnection() {
  console.log('🔍 Testing server connectivity...');
  
  // Test the basic endpoint
  try {
    console.log('\n1️⃣ Testing /api/test endpoint...');
    const testResponse = await axios.get('http://localhost:5000/api/test');
    console.log('✅ Success! Server responded with:', testResponse.data);
  } catch (error) {
    console.error('❌ Error accessing /api/test:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
  
  // Test the direct test endpoint
  try {
    console.log('\n2️⃣ Testing /api/direct-test endpoint...');
    const directResponse = await axios.get('http://localhost:5000/api/direct-test');
    console.log('✅ Success! Server responded with:', directResponse.data);
  } catch (error) {
    console.error('❌ Error accessing /api/direct-test:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
  
  // Test the proxy check endpoint with a simple proxy
  try {
    console.log('\n3️⃣ Testing /api/check-proxy endpoint with a sample proxy...');
    const proxyResponse = await axios.post('http://localhost:5000/api/check-proxy', {
      proxy: '103.173.78.163:8000'
    });
    console.log('✅ Success! Server responded with:', proxyResponse.data);
  } catch (error) {
    console.error('❌ Error accessing /api/check-proxy:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

// Run the tests
testServerConnection().catch(error => {
  console.error('🚨 Unexpected error:', error);
}); 