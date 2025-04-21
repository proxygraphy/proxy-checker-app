import React, { useState, useEffect } from 'react';
import './App.css';
import ProxyInput from './components/ProxyInput';
import ResultsTable from './components/ResultsTable';

function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');

  // Test server connection on component mount
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch('/api/test');
        if (response.ok) {
          setServerStatus('connected');
          console.log('Server connected successfully');
        } else {
          setServerStatus('error');
          console.error('Server responded with error:', response.status);
        }
      } catch (err) {
        setServerStatus('error');
        console.error('Failed to connect to server:', err);
      }
    };
    
    checkServer();
  }, []);

  const checkProxies = async (proxies) => {
    setLoading(true);
    setError('');
    
    try {
      // Process each proxy
      const proxyStrings = proxies.split('\n').filter(line => line.trim() !== '');
      console.log(`Processing ${proxyStrings.length} proxies`);
      
      // Start checking proxies one by one
      const resultsArray = [];
      
      for (const proxy of proxyStrings) {
        try {
          console.log(`Checking proxy: ${proxy}`);
          const response = await fetch('/api/check-proxy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ proxy: proxy.trim() }),
          });
          
          if (!response.ok) {
            console.error(`Proxy check failed with status: ${response.status}`);
            resultsArray.push({
              working: false,
              originalString: proxy.trim(),
              error: `Server error: ${response.status}`
            });
            setResults([...resultsArray]);
            continue;
          }
          
          const data = await response.json();
          console.log(`Proxy result:`, data);
          resultsArray.push({
            ...data,
            originalString: proxy.trim()
          });
          
          // Update results in real-time
          setResults([...resultsArray]);
        } catch (err) {
          console.error(`Error checking proxy ${proxy}:`, err);
          // Add failed result
          resultsArray.push({
            working: false,
            originalString: proxy.trim(),
            error: `Client error: ${err.message}`
          });
          setResults([...resultsArray]);
        }
      }
    } catch (err) {
      console.error('Error processing proxies:', err);
      setError('Error processing proxies: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Proxy Checker</h1>
        {serverStatus === 'checking' && <div className="server-status checking">Connecting to server...</div>}
        {serverStatus === 'connected' && <div className="server-status connected">Server connected</div>}
        {serverStatus === 'error' && <div className="server-status error">Server connection error!</div>}
      </header>
      <main>
        <ProxyInput onSubmit={checkProxies} disabled={loading || serverStatus !== 'connected'} />
        
        {error && <div className="error-message">{error}</div>}
        
        {loading && <div className="loading-message">
          Checking proxies... ({results.length} processed)
        </div>}
        
        {results.length > 0 && <ResultsTable results={results} />}
      </main>
    </div>
  );
}

export default App;
