// Direct proxy test script
const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');

async function testProxy(proxyString) {
  console.log(`Testing proxy: ${proxyString}`);
  
  // Parse proxy string
  const parts = proxyString.split(':');
  if (parts.length < 2) {
    console.error('Invalid proxy format. Use IP:PORT or IP:PORT:USER:PASS');
    return;
  }
  
  const ip = parts[0];
  const port = parts[1];
  let proxyUrl;
  
  if (parts.length >= 4) {
    // Has authentication
    const username = parts[2];
    const password = parts[3];
    proxyUrl = `http://${username}:${password}@${ip}:${port}`;
  } else {
    // No authentication
    proxyUrl = `http://${ip}:${port}`;
  }
  
  console.log(`Using proxy URL: ${proxyUrl}`);
  
  try {
    const agent = new HttpsProxyAgent(proxyUrl);
    
    console.log('Making request via proxy...');
    const response = await axios.get('https://api.ipify.org?format=json', {
      httpsAgent: agent,
      timeout: 15000,
      validateStatus: function (status) {
        return status >= 200 && status < 600;
      }
    });
    
    console.log(`Request successful! Status: ${response.status}`);
    console.log(`Response data:`, response.data);
    
    return {
      working: true,
      ip: response.data.ip
    };
  } catch (error) {
    console.error('Error making proxy request:', error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    
    return {
      working: false,
      error: error.message
    };
  }
}

// Get proxy from command line or use a default
const proxyToTest = process.argv[2] || '103.173.78.163:8000';

// Run the test
testProxy(proxyToTest)
  .then(result => {
    console.log('\nTest result:', result);
    if (result.working) {
      console.log('✅ Proxy is working!');
    } else {
      console.log('❌ Proxy is not working.');
    }
  })
  .catch(err => {
    console.error('Unexpected error during test:', err);
  }); 