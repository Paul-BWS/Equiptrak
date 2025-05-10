import { useState } from 'react';
import { createTables, insertDefaultData } from '@/scripts/create-postgres-tables';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import DatabaseConnectionStatus from '@/components/DatabaseConnectionStatus';

export default function DatabaseSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [setupStatus, setSetupStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const handleSetupDatabase = async () => {
    setIsLoading(true);
    setSetupStatus('running');
    setLogs([]);
    addLog('Starting database setup...');

    try {
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

      // Run the setup
      addLog('Creating tables...');
      const success = await createTables();
      
      if (success) {
        addLog('Tables created successfully!');
        setSetupStatus('success');
      } else {
        addLog('Failed to create tables.');
        setSetupStatus('error');
      }

      // Restore console functions
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    } catch (error) {
      addLog(`Error setting up database: ${error}`);
      setSetupStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Database Setup</h1>
      
      <DatabaseConnectionStatus />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>PostgreSQL Database Setup</CardTitle>
            <CardDescription>
              This will create the necessary tables in your PostgreSQL database and insert default data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Click the button below to set up your PostgreSQL database for EquipTrak.
              This will create the following tables:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li>Companies</li>
              <li>Contacts</li>
              <li>Equipment Types</li>
              <li>Equipment</li>
            </ul>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Warning:</strong> This will create new tables in your database.
                    If tables already exist, they will not be dropped, but may be altered.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSetupDatabase} 
              disabled={isLoading || setupStatus === 'running'}
              className="w-full"
            >
              {isLoading ? 'Setting Up...' : 'Set Up Database'}
            </Button>
          </CardFooter>
        </Card>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Setup Logs</CardTitle>
              <CardDescription>
                Progress and error messages will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-md h-96 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <p className="text-gray-500">No logs yet. Start the setup to see logs.</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className={`mb-1 ${log.includes('ERROR') ? 'text-red-600' : ''}`}>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter>
              {setupStatus === 'success' && (
                <div className="flex items-center text-green-600 w-full justify-center">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  <span>Setup completed successfully!</span>
                </div>
              )}
              {setupStatus === 'error' && (
                <div className="flex items-center text-red-600 w-full justify-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>Setup failed. Check the logs for details.</span>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 