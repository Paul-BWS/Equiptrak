import { useState, useEffect } from 'react';

export function HealthCheck() {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check basic health
        const healthResponse = await fetch('http://localhost:3003/api/health');
        const basicHealth = await healthResponse.json();
        
        // Check auth health
        let authHealth = null;
        try {
          const authResponse = await fetch('http://localhost:3003/api/auth/health');
          authHealth = await authResponse.json();
        } catch (err) {
          console.error('Auth health check failed:', err);
        }
        
        // Try a direct login
        let loginTest = null;
        try {
          const loginResponse = await fetch('http://localhost:3003/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'admin@equiptrak.com',
              password: 'admin@2024'
            })
          });
          loginTest = {
            status: loginResponse.status,
            ok: loginResponse.ok,
            data: loginResponse.status !== 204 ? await loginResponse.json() : null
          };
        } catch (err) {
          console.error('Login test failed:', err);
          loginTest = { error: err.message };
        }
        
        setHealthData({
          timestamp: new Date().toISOString(),
          basicHealth,
          authHealth,
          loginTest
        });
      } catch (err) {
        setError(err.message || 'Unknown error');
        console.error('Health check failed:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkHealth();
  }, []);
  
  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-bold mb-4">Server Health Check</h2>
      
      {loading && <p className="text-gray-500">Checking server health...</p>}
      
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-md mb-4">
          <p className="text-red-700 font-semibold">Error: {error}</p>
        </div>
      )}
      
      {healthData && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Last checked: {new Date(healthData.timestamp).toLocaleString()}
          </p>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Basic Health</h3>
            <pre className="bg-gray-100 p-2 rounded-md text-sm overflow-auto">
              {JSON.stringify(healthData.basicHealth, null, 2)}
            </pre>
          </div>
          
          {healthData.authHealth && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Auth System</h3>
              <pre className="bg-gray-100 p-2 rounded-md text-sm overflow-auto">
                {JSON.stringify(healthData.authHealth, null, 2)}
              </pre>
            </div>
          )}
          
          {healthData.loginTest && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Login Test</h3>
              <div className={`p-2 rounded-md ${healthData.loginTest.ok ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className="font-semibold mb-1">
                  Status: {healthData.loginTest.status} {healthData.loginTest.ok ? '✅' : '❌'}
                </p>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(healthData.loginTest.data || healthData.loginTest.error, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 flex gap-2">
        <button 
          onClick={() => window.location.reload()}
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Refresh
        </button>
        <a 
          href="/login"
          className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
} 