import React from 'react';

const ResultsTable = ({ results }) => {
  // Calculate statistics
  const totalProxies = results.length;
  const workingProxies = results.filter(proxy => proxy.working).length;
  const failedProxies = totalProxies - workingProxies;
  
  return (
    <div className="results-container">
      <h2>Proxy Check Results</h2>
      
      <div className="results-stats">
        <div className="stat-item">
          <span className="stat-label">Total:</span>
          <span className="stat-value">{totalProxies}</span>
        </div>
        <div className="stat-item working">
          <span className="stat-label">Working:</span>
          <span className="stat-value">{workingProxies}</span>
        </div>
        <div className="stat-item failed">
          <span className="stat-label">Failed:</span>
          <span className="stat-value">{failedProxies}</span>
        </div>
      </div>
      
      <div className="table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Proxy</th>
              <th>IP</th>
              <th>Country</th>
              <th>Region</th>
              <th>City</th>
              <th>ISP</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index} className={result.working ? 'working-row' : 'failed-row'}>
                <td className="status-cell">
                  {result.working ? 
                    <span className="status-working">Working</span> : 
                    <span className="status-failed">Failed</span>
                  }
                </td>
                <td>{result.originalString}</td>
                <td>{result.proxyIp || 'N/A'}</td>
                <td>{result.country || 'N/A'}</td>
                <td>{result.region || 'N/A'}</td>
                <td>{result.city || 'N/A'}</td>
                <td>{result.isp || 'N/A'}</td>
                <td className="error-cell">{result.error || 'None'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable; 