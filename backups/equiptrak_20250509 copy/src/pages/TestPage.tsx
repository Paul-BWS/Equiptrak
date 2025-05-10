import { useState, useEffect } from 'react';
import ApiClient from '@/utils/ApiClient';

export function TestPage() {
  const [apiStatus, setApiStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [message, setMessage] = useState<string>('Checking API status...');
  const [testLoginResult, setTestLoginResult] = useState<string | null>(null);
  const [isTestingLogin, setIsTestingLogin] = useState(false);
  const [directApiUrl, setDirectApiUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Use our new ApiClient
        const directResponse = await fetch('http://localhost:3002/api/health');
        setDirectApiUrl(directResponse.ok ? 'http://localhost:3002' : null);
        
        // First try a simple endpoint that doesn't require auth
        const response = await ApiClient.get('/api/health');
        
        if (response.ok) {
          setApiStatus('online');
          setMessage(`API is running and health endpoint responded OK (${response.status})`);
        } else if (response.status === 404) {
          // A 404 means the API is running but endpoint doesn't exist
          setApiStatus('online');
          setMessage('API is running (received 404 from health endpoint)');
        } else {
          throw new Error(`API responded with status: ${response.status}`);
        }
      } catch (error) {
        console.error('API check failed:', error);
        setApiStatus('offline');
        setMessage(`API appears to be offline: ${error.message}`);
      }
    };
    
    checkApiStatus();
  }, []);
  
  const testLogin = async () => {
    setIsTestingLogin(true);
    setTestLoginResult('Testing login...');
    
    try {
      // Use the known working credentials
      const response = await ApiClient.post('/api/auth/login', {
        email: 'admin@equiptrak.com',
        password: 'admin@2024'
      });
      
      if (response.ok) {
        setTestLoginResult(JSON.stringify(response.data, null, 2));
      } else {
        setTestLoginResult(`Login failed: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      setTestLoginResult(`Login request failed: ${error.message}`);
    } finally {
      setIsTestingLogin(false);
    }
  };
  
  const testDirectApi = async () => {
    setIsTestingLogin(true);
    setTestLoginResult('Testing direct API access...');
    
    try {
      // Try direct access to API
      const response = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@equiptrak.com',
          password: 'admin@2024'
        })
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        setTestLoginResult(`Direct API successful:\n${JSON.stringify(responseData, null, 2)}`);
      } else {
        setTestLoginResult(`Direct API failed: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      setTestLoginResult(`Direct API request failed: ${error.message}`);
    } finally {
      setIsTestingLogin(false);
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-md">
        <h1 className="mb-4 text-2xl font-bold">EquipTrack Test Page</h1>
        
        <div className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">API Status:</h2>
          <div className={`flex items-center rounded-md p-3 ${
            apiStatus === 'online' ? 'bg-green-100 text-green-800' :
            apiStatus === 'offline' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            <div className={`mr-2 h-3 w-3 rounded-full ${
              apiStatus === 'online' ? 'bg-green-500' :
              apiStatus === 'offline' ? 'bg-red-500' :
              'bg-yellow-500'
            }`}></div>
            <span>{message}</span>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Frontend Environment:</h2>
          <div className="rounded-md bg-gray-100 p-3">
            <p><strong>Base URL:</strong> {window.location.origin}</p>
            <p><strong>Current Path:</strong> {window.location.pathname}</p>
            <p><strong>Direct API URL:</strong> {directApiUrl || 'Not available'}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <button 
            onClick={testLogin}
            disabled={isTestingLogin || apiStatus === 'offline'}
            className={`mb-2 w-full rounded-md ${
              apiStatus === 'online' 
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            } px-4 py-2 text-center`}
          >
            {isTestingLogin ? 'Testing...' : 'Test Login API'}
          </button>
          
          <button 
            onClick={testDirectApi}
            disabled={isTestingLogin}
            className="mb-2 w-full rounded-md bg-green-500 px-4 py-2 text-center text-white hover:bg-green-600"
          >
            Test Direct API Access
          </button>
          
          {testLoginResult && (
            <div className="mt-2 rounded-md bg-gray-800 p-3 font-mono text-sm text-white">
              <pre className="whitespace-pre-wrap">{testLoginResult}</pre>
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-2">
          <a 
            href="/login" 
            className="rounded-md bg-blue-500 px-4 py-2 text-center text-white hover:bg-blue-600"
          >
            Go to Login Page
          </a>
          <button 
            onClick={() => window.location.reload()}
            className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Refresh This Page
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestPage; 