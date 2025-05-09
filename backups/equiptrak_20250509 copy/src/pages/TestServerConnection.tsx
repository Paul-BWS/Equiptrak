import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Server, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function TestServerConnection() {
  const [results, setResults] = useState<Array<{url: string, status: string, message: string, responseTime?: number}>>([]);
  const [loading, setLoading] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [overallStatus, setOverallStatus] = useState<'checking' | 'online' | 'partial' | 'offline'>('checking');

  // Test connection to Supabase
  const testConnections = async () => {
    setLoading(true);
    setResults([]);
    setOverallStatus('checking');
    
    // Get network information if available
    try {
      // @ts-ignore - Connection API might not be available in all browsers
      if (navigator.connection) {
        // @ts-ignore
        setNetworkInfo({
          // @ts-ignore
          effectiveType: navigator.connection.effectiveType,
          // @ts-ignore
          downlink: navigator.connection.downlink,
          // @ts-ignore
          rtt: navigator.connection.rtt,
          // @ts-ignore
          saveData: navigator.connection.saveData
        });
      }
    } catch (e) {
      console.error("Error getting network info:", e);
    }
    
    // Test Supabase connection
    try {
      console.log('Testing connection to Supabase...');
      const startTime = Date.now();
      
      // Test Supabase connection by fetching health status
      const { data, error } = await supabase.from('health_check').select('*').limit(1);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (!error) {
        setResults(prev => [...prev, {
          url: 'Supabase Connection',
          status: 'Success',
          message: `Response time: ${responseTime}ms, Successfully connected to Supabase`,
          responseTime
        }]);
        setOverallStatus('online');
      } else {
        setResults(prev => [...prev, {
          url: 'Supabase Connection',
          status: 'Error',
          message: `Error connecting to Supabase: ${error.message}`,
          responseTime
        }]);
        setOverallStatus('offline');
      }
    } catch (e) {
      setResults(prev => [...prev, {
        url: 'Supabase Connection',
        status: 'Error',
        message: `Exception: ${e instanceof Error ? e.message : 'Unknown error'}`,
      }]);
      setOverallStatus('offline');
    }
    
    setLoading(false);
  };

  // Run test on component mount
  useEffect(() => {
    testConnections();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <Link to="/admin" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin
        </Link>
        <h1 className="text-2xl font-bold">Connection Test</h1>
      </div>
      
      <div className="space-y-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Connection Status</h2>
            <Button 
              variant="outline" 
              onClick={testConnections}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Test Connections
                </>
              )}
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <h3 className="font-medium text-gray-700">Supabase Connection</h3>
              <p className="text-sm text-gray-500">Connection to your Supabase project</p>
              <div className="mt-2">
                {loading ? (
                  <div className="flex items-center text-yellow-600">
                    <RefreshCw className="animate-spin mr-2 h-4 w-4" />
                    <span>Checking...</span>
                  </div>
                ) : overallStatus === 'online' ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span>Online</span>
                  </div>
                ) : overallStatus === 'partial' ? (
                  <div className="flex items-center text-yellow-600">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    <span>Partially reachable</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <XCircle className="mr-2 h-4 w-4" />
                    <span>Offline or unreachable</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {networkInfo && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Network Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <h3 className="font-medium text-gray-700">Connection Type</h3>
                <p className="text-lg">{networkInfo.effectiveType || 'Unknown'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <h3 className="font-medium text-gray-700">Downlink</h3>
                <p className="text-lg">{networkInfo.downlink ? `${networkInfo.downlink} Mbps` : 'Unknown'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <h3 className="font-medium text-gray-700">Round Trip Time</h3>
                <p className="text-lg">{networkInfo.rtt ? `${networkInfo.rtt} ms` : 'Unknown'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <h3 className="font-medium text-gray-700">Data Saver</h3>
                <p className="text-lg">{networkInfo.saveData ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Connection Test Results</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Endpoint
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Response Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  <RefreshCw className="inline-block animate-spin mr-2 h-4 w-4" />
                  Testing connections...
                </td>
              </tr>
            ) : results.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  No results yet
                </td>
              </tr>
            ) : (
              results.map((result, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                    {result.url}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      result.status === 'Success' ? 'bg-green-100 text-green-800' : 
                      result.status === 'Warning' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {result.responseTime ? `${result.responseTime}ms` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {result.message}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Troubleshooting Steps</h2>
        
        <div className="space-y-4">
          <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
            <h3 className="font-medium text-blue-800">1. Check Supabase Connection</h3>
            <p className="mt-1 text-blue-700">
              Ensure your Supabase project is online and accessible
            </p>
            <p className="mt-1 text-blue-700">
              Verify that your Supabase URL and API keys are correctly configured in your environment variables
            </p>
          </div>
          
          <div className="p-4 border-l-4 border-green-500 bg-green-50">
            <h3 className="font-medium text-green-800">2. Check Environment Variables</h3>
            <p className="mt-1 text-green-700">
              Verify that your <code className="bg-green-100 px-1 rounded">.env</code> file has valid Supabase credentials.
            </p>
            <p className="mt-1 text-green-700">
              The application needs <code className="bg-green-100 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-green-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to function properly.
            </p>
          </div>
          
          <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
            <h3 className="font-medium text-yellow-800">3. Check Internet Connection</h3>
            <p className="mt-1 text-yellow-700">
              Ensure you have a stable internet connection.
            </p>
            <p className="mt-1 text-yellow-700">
              Try accessing your Supabase project directly in the browser to verify it's accessible.
            </p>
          </div>
          
          <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
            <h3 className="font-medium text-purple-800">4. Check Browser Console</h3>
            <p className="mt-1 text-purple-700">
              Open your browser's developer tools (F12) and check the console for any error messages.
            </p>
            <p className="mt-1 text-purple-700">
              Try refreshing the page or signing out and back in if you're experiencing authentication issues.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 