import React, { useState } from 'react';

const ProxyInput = ({ onSubmit, disabled }) => {
  const [proxyList, setProxyList] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (proxyList.trim() !== '') {
      onSubmit(proxyList);
    }
  };
  
  const insertSampleProxy = () => {
    setProxyList('103.173.78.163:8000\n88.198.24.108:1080\n117.121.206.58:7497');
  };

  return (
    <div className="proxy-input-container">
      <h2>Enter Proxy List</h2>
      <p className="input-hint">
        Enter one proxy per line in the format: <code>IP:PORT</code> or <code>IP:PORT:USERNAME:PASSWORD</code>
      </p>
      
      <form onSubmit={handleSubmit}>
        <textarea 
          className="proxy-textarea"
          value={proxyList}
          onChange={(e) => setProxyList(e.target.value)}
          placeholder="Example:
192.168.1.1:8080
10.0.0.1:3128:username:password"
          rows={10}
          disabled={disabled}
        />
        
        <div className="form-actions">
          <button 
            type="button" 
            className="sample-button"
            onClick={insertSampleProxy}
            disabled={disabled}
          >
            Insert Sample Proxies
          </button>
          <button 
            type="submit" 
            className="check-button"
            disabled={disabled || proxyList.trim() === ''}
          >
            {disabled ? 'Checking...' : 'Check Proxies'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProxyInput; 