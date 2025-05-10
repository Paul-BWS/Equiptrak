import { useState } from 'react';
import { migrateTable, migrateAllTables } from '../scripts/migrate-data';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import DatabaseConnectionStatus from '@/components/DatabaseConnectionStatus';

// Tables that can be migrated
const TABLES = [
  'companies',
  'equipment_types',
  'equipment',
  'engineers',
  'service_records',
  'compressor_records',
  'spot_welder_records',
  'spot_welder_service_records',
  'loler_records',
  'loler_service_records',
  'rivet_tool_records',
  'rivet_tool_service_records',
  'fault_reports',
  'conversations',
  'messages',
  'notes'
];

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
        <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Database Migration Tool</h2>
        <p className="text-red-600 mb-4">{error.message}</p>
        <div className="flex gap-4">
          <Button onClick={resetErrorBoundary} variant="outline">
            Try Again
          </Button>
          <Button onClick={() => window.location.href = "/"}>
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

function DatabaseMigrationContent() {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  
  // Function to add a log message
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };
  
  // Function to migrate a single table
  const handleMigrateTable = async () => {
    if (!selectedTable) {
      addLog('Please select a table to migrate');
      return;
    }
    
    try {
      setMigrationStatus('migrating');
      addLog(`Starting migration of table: ${selectedTable}`);
      
      // Override console.log to capture logs
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      
      console.log = (message: any) => {
        addLog(message.toString());
        originalConsoleLog(message);
      };
      
      console.error = (message: any) => {
        addLog(`ERROR: ${message.toString()}`);
        originalConsoleError(message);
      };
      
      await migrateTable(selectedTable);
      
      // Restore console.log
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      
      addLog(`Migration of table ${selectedTable} completed`);
      setMigrationStatus('success');
    } catch (error) {
      addLog(`Error migrating table ${selectedTable}: ${error}`);
      setMigrationStatus('error');
    }
  };
  
  // Function to migrate all tables
  const handleMigrateAll = async () => {
    try {
      setMigrationStatus('migrating');
      addLog('Starting migration of all tables');
      
      // Override console.log to capture logs
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      
      console.log = (message: any) => {
        addLog(message.toString());
        originalConsoleLog(message);
      };
      
      console.error = (message: any) => {
        addLog(`ERROR: ${message.toString()}`);
        originalConsoleError(message);
      };
      
      await migrateAllTables();
      
      // Restore console.log
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      
      addLog('Migration of all tables completed');
      setMigrationStatus('success');
    } catch (error) {
      addLog(`Error migrating all tables: ${error}`);
      setMigrationStatus('error');
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Database Migration Tool</h1>
      
      <DatabaseConnectionStatus />
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Warning:</strong> This tool will migrate data from Supabase to PostgreSQL. 
              Make sure you have a backup of your data before proceeding.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Migrate Single Table</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Table
              </label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a table</option>
                {TABLES.map((table) => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleMigrateTable}
              disabled={!selectedTable || migrationStatus === 'migrating'}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {migrationStatus === 'migrating' ? 'Migrating...' : 'Migrate Table'}
            </button>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Migrate All Tables</h2>
            
            <button
              onClick={handleMigrateAll}
              disabled={migrationStatus === 'migrating'}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {migrationStatus === 'migrating' ? 'Migrating...' : 'Migrate All Tables'}
            </button>
          </div>
        </div>
        
        <div>
          <div className="bg-white shadow rounded-lg p-6 h-full">
            <h2 className="text-xl font-semibold mb-4">Migration Logs</h2>
            
            <div className="bg-gray-100 p-4 rounded-md h-96 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs yet. Start a migration to see logs.</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className={`mb-1 ${log.includes('ERROR') ? 'text-red-600' : ''}`}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DatabaseMigration() {
  const [key, setKey] = useState(0);

  // Function to reset the error boundary
  const handleReset = () => {
    setKey(prevKey => prevKey + 1);
  };

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback} 
      onReset={handleReset}
      key={key}
    >
      <DatabaseMigrationContent />
    </ErrorBoundary>
  );
} 