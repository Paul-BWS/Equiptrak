import React from 'react';

export function ApiUnavailable() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-red-600">API Server Unavailable</h1>
        
        <div className="mb-6 rounded-md bg-red-50 p-4 text-red-800">
          <p className="mb-2">The EquipTrack API server appears to be offline or unreachable.</p>
          <p>This means the application cannot function properly at this time.</p>
        </div>
        
        <div className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Possible Solutions:</h2>
          <ul className="ml-6 list-disc space-y-2">
            <li>Check if the API server (port 3001) is running</li>
            <li>Restart both the API and frontend servers</li>
            <li>Check for network connectivity issues</li>
            <li>Verify proxy settings in vite.config.ts</li>
          </ul>
        </div>
        
        <div className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Run these commands:</h2>
          <div className="rounded-md bg-gray-800 p-3 font-mono text-sm text-white">
            <p>npm run dev:stop</p>
            <p>npm run dev:all</p>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <a 
            href="/login" 
            className="rounded-md bg-blue-500 px-4 py-2 text-center text-white hover:bg-blue-600"
          >
            Try Login Again
          </a>
          <a 
            href="/test" 
            className="rounded-md bg-gray-500 px-4 py-2 text-center text-white hover:bg-gray-600"
          >
            Go to Test Page
          </a>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApiUnavailable; 