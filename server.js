const express = require('express');
const cors = require('cors');
const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');
const SocksProxyAgent = require('socks-proxy-agent');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// More permissive CORS configuration - allow from anywhere
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Standard CORS middleware with permissive settings
app.use(cors({
  origin: '*',  // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json());

// Simple welcome endpoint
app.get('/', (req, res) => {
  res.send('Proxy Checker API is running');
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint accessed');
  res.json({ message: 'API is working!' });
});

// Simple test endpoint for checking connection without proxy
app.get('/api/direct-test', async (req, res) => {
  try {
    console.log('Direct test requested');
    const response = await axios.get('https://api.ipify.org?format=json');
    res.json({ 
      message: 'Direct connection successful', 
      ip: response.data.ip 
    });
  } catch (error) {
    console.error('Direct test error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Check proxy endpoint
app.post('/api/check-proxy', async (req, res) => {
  console.log('Received proxy check request:', req.body);
  
  const { proxy } = req.body;
  
  if (!proxy) {
    console.log('No proxy provided in request');
    return res.status(400).json({ 
      error: 'Proxy information is required',
      working: false 
    });
  }
  
  try {
    console.log(`Starting check for proxy: ${proxy}`);
    const result = await checkProxy(proxy);
    console.log(`Check completed for proxy: ${proxy}`, result);
    res.json(result);
  } catch (error) {
    console.error('Error checking proxy:', error);
    res.status(500).json({ 
      error: 'Failed to check proxy', 
      message: error.message,
      working: false,
      originalString: proxy
    });
  }
});

// Batch check proxies
app.post('/api/check-proxies', async (req, res) => {
  const { proxies } = req.body;
  
  if (!proxies || !Array.isArray(proxies) || proxies.length === 0) {
    return res.status(400).json({ error: 'Valid proxy list is required' });
  }
  
  // Return initial response to prevent timeout
  res.json({ 
    message: 'Processing proxies', 
    total: proxies.length 
  });
  
  // Process would continue in background
  // In a production app, you might want to use a queue system or websockets
});

async function checkProxy(proxyString) {
  console.log(`Checking proxy: ${proxyString}`);
  
  // Parse proxy string (IP:PORT or IP:PORT:USER:PASS)
  const parts = proxyString.split(':');
  
  if (parts.length < 2) {
    console.log('Invalid proxy format');
    throw new Error('Invalid proxy format. Use IP:PORT or IP:PORT:USER:PASS');
  }
  
  const ip = parts[0];
  const port = parts[1];
  let agent;
  const proxyUrl = parts.length >= 4 
    ? `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}`
    : `${parts[0]}:${parts[1]}`;
    
  console.log(`Parsed proxy URL: ${proxyUrl} (IP: ${ip}, Port: ${port})`);
  
  try {
    if (parts.length >= 4) {
      // Has authentication
      const username = parts[2];
      const password = parts[3];
      
      // Check if it's a SOCKS proxy
      if (proxyString.toLowerCase().includes('socks')) {
        console.log('Creating SOCKS proxy agent with auth');
        agent = new SocksProxyAgent(`socks://${username}:${password}@${ip}:${port}`);
      } else {
        console.log('Creating HTTPS proxy agent with auth');
        agent = new HttpsProxyAgent(`http://${username}:${password}@${ip}:${port}`);
      }
    } else {
      // No authentication
      console.log('Creating HTTPS proxy agent without auth');
      agent = new HttpsProxyAgent(`http://${ip}:${port}`);
    }
    
    console.log('Making test request via proxy...');
    // Test the proxy with a longer timeout
    const response = await axios.get('https://api.ipify.org?format=json', {
      httpsAgent: agent,
      timeout: 15000, // 15 seconds timeout
      validateStatus: function (status) {
        return status >= 200 && status < 600; // Accept all status codes to check the response
      }
    });
    
    console.log(`Proxy response status: ${response.status}`);
    
    if (response.status >= 200 && response.status < 300 && response.data && response.data.ip) {
      console.log(`Proxy working! IP: ${response.data.ip}`);
      // If we reach here, the proxy works. Now get geolocation info.
      const geoInfo = await getGeoInfo(response.data.ip);
      
      return {
        working: true,
        proxyIp: response.data.ip,
        originalString: proxyString,
        ...geoInfo
      };
    } else {
      console.log(`Proxy request failed with status: ${response.status}`);
      return {
        working: false,
        originalString: proxyString,
        error: `Invalid response (Status: ${response.status})`
      };
    }
  } catch (error) {
    console.error(`Proxy check error for ${proxyString}:`, error.message);
    // Determine if it's a timeout, connection refused, or other error
    let errorMessage = error.message;
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection timed out';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Connection aborted (timeout)';
    }
    
    return {
      working: false,
      originalString: proxyString,
      error: errorMessage
    };
  }
}

async function getGeoInfo(ip) {
  try {
    // Using ipapi.co for geolocation (free for limited requests)
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    const data = response.data;
    
    return {
      country: data.country_name,
      countryCode: data.country_code,
      region: data.region,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      isp: data.org // Organization/ISP
    };
  } catch (error) {
    console.error('Error fetching geo info:', error.message);
    return {
      geoError: 'Could not fetch geolocation information'
    };
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 