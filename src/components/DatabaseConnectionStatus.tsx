import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import db from '@/lib/db';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function DatabaseConnectionStatus() {
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [postgresStatus, setPostgresStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [postgresError, setPostgresError] = useState<string | null>(null);

  useEffect(() => {
    // Check Supabase connection
    const checkSupabase = async () => {
      try {
        // Use a simpler query that doesn't use count(*) to avoid parsing errors
        const { data, error } = await supabase
          .from('companies')
          .select('id')
          .limit(1);
        
        if (error) {
          console.error('Supabase connection error:', error);
          setSupabaseStatus('error');
          setSupabaseError(error.message);
        } else {
          console.log('Supabase connection successful');
          setSupabaseStatus('connected');
        }
      } catch (error) {
        console.error('Unexpected Supabase error:', error);
        setSupabaseStatus('error');
        setSupabaseError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    // Check PostgreSQL connection
    const checkPostgres = async () => {
      try {
        await db.query('SELECT 1');
        console.log('PostgreSQL connection successful');
        setPostgresStatus('connected');
      } catch (error) {
        console.error('PostgreSQL connection error:', error);
        setPostgresStatus('error');
        setPostgresError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    checkSupabase();
    checkPostgres();
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Database Connection Status</h2>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <div className="w-32 font-medium">Supabase:</div>
          <div className="flex items-center">
            {supabaseStatus === 'checking' && (
              <div className="flex items-center">
                <div className="h-3 w-3 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
                <span>Checking...</span>
              </div>
            )}
            
            {supabaseStatus === 'connected' && (
              <div className="flex items-center text-green-600">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <span>Connected</span>
              </div>
            )}
            
            {supabaseStatus === 'error' && (
              <div className="flex items-center text-red-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>Error: {supabaseError}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-32 font-medium">PostgreSQL:</div>
          <div className="flex items-center">
            {postgresStatus === 'checking' && (
              <div className="flex items-center">
                <div className="h-3 w-3 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
                <span>Checking...</span>
              </div>
            )}
            
            {postgresStatus === 'connected' && (
              <div className="flex items-center text-green-600">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <span>Connected</span>
              </div>
            )}
            
            {postgresStatus === 'error' && (
              <div className="flex items-center text-red-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>Error: {postgresError}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 