import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function FixNotesTable() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.company_id) {
      setCompanyId(user.company_id);
    }
  }, [user]);

  const createNotesTable = async () => {
    setLoading(true);
    setError(null);
    setMessage('Creating notes table...');
    
    try {
      const response = await fetch('http://localhost:3003/api/debug/create-notes-table', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      const result = await response.json();
      setMessage(result.message || 'Notes table operation completed');
    } catch (err) {
      console.error('Failed to create notes table:', err);
      setError('Failed to create notes table: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const checkNotesTable = async () => {
    if (!companyId) {
      setError('No company ID available. Please enter one.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage('Checking notes table for company ' + companyId);
    
    try {
      const response = await fetch(`http://localhost:3003/api/debug/notes/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      setMessage(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('Failed to check notes table:', err);
      setError('Failed to check notes table: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const addSampleNote = async () => {
    if (!companyId) {
      setError('No company ID available. Please enter one.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage('Adding sample note to company ' + companyId);
    
    try {
      const response = await fetch(`http://localhost:3003/api/companies/${companyId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: 'This is a test note created at ' + new Date().toISOString(),
          note_type: 'user'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server responded with ${response.status}: ${errorData.error || errorData.message || 'Unknown error'}`);
      }
      
      const result = await response.json();
      setMessage('Note created successfully: ' + JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('Failed to add sample note:', err);
      setError('Failed to add sample note: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Notes Table Utility</h1>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Company ID:</label>
        <input 
          type="text" 
          value={companyId} 
          onChange={(e) => setCompanyId(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter company ID"
        />
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={createNotesTable}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Create Notes Table
        </button>
        
        <button
          onClick={checkNotesTable}
          disabled={loading || !companyId}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Check Notes Table
        </button>
        
        <button
          onClick={addSampleNote}
          disabled={loading || !companyId}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Add Sample Note
        </button>
      </div>
      
      {loading && (
        <div className="mb-4 text-blue-500">
          Loading...
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {message && (
        <div className="p-3 bg-gray-100 border rounded">
          <h3 className="font-semibold mb-2">Response:</h3>
          <pre className="whitespace-pre-wrap overflow-auto max-h-96">{message}</pre>
        </div>
      )}
    </div>
  );
} 