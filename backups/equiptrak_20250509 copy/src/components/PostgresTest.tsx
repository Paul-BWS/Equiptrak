import { useState, useEffect } from 'react';
import companiesApi from '../api/companies';
import type { Company } from '../repositories/companies';
import db from '../lib/db';
import dbAdapter from '../lib/database-adapter';
import DatabaseConnectionStatus from './DatabaseConnectionStatus';

export default function PostgresTest() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [connectionTime, setConnectionTime] = useState<string | null>(null);
  const [databaseMode, setDatabaseMode] = useState<'postgres' | 'supabase'>('postgres');

  // Load companies and test connection on component mount
  useEffect(() => {
    loadCompanies();
    testConnection();
    loadEquipment();
    checkDatabaseMode();
  }, []);

  // Function to check which database is being used
  const checkDatabaseMode = () => {
    const usePostgres = import.meta.env.VITE_USE_POSTGRES === 'true';
    setDatabaseMode(usePostgres ? 'postgres' : 'supabase');
  };

  // Function to test database connection
  const testConnection = async () => {
    try {
      setConnectionStatus('loading');
      const result = await db.query('SELECT NOW() as time');
      setConnectionTime(result[0]?.time);
      setConnectionStatus('success');
    } catch (err) {
      console.error('Connection test error:', err);
      setConnectionStatus('error');
    }
  };

  // Function to load equipment
  const loadEquipment = async () => {
    try {
      // Using the database adapter
      const data = await dbAdapter.rawQuery(`
        SELECT 
          e.id, e.name, e.serial_number, e.model, e.manufacturer,
          et.name as equipment_type,
          c.name as company_name
        FROM 
          equipment e
        JOIN 
          equipment_types et ON e.type_id = et.id
        JOIN 
          companies c ON e.company_id = c.id
        ORDER BY 
          c.name, e.name
      `);
      
      setEquipment(data);
    } catch (err) {
      console.error('Error loading equipment:', err);
    }
  };

  // Function to load companies
  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Using the database adapter
      const data = await dbAdapter.query('companies', {
        order: { name: 'asc' }
      });
      
      setCompanies(data);
    } catch (err) {
      console.error('Error loading companies:', err);
      setError('Failed to load companies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new company
  const handleCreateCompany = async () => {
    if (!newCompanyName.trim()) {
      setError('Company name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Using the database adapter
      await dbAdapter.insert('companies', {
        name: newCompanyName,
        address: '123 Test Street',
        contact_name: 'Test Contact',
        contact_email: 'test@example.com',
        contact_phone: '123-456-7890'
      });
      
      setNewCompanyName('');
      await loadCompanies();
    } catch (err) {
      console.error('Error creating company:', err);
      setError('Failed to create company. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a company
  const handleDeleteCompany = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Using the database adapter
      await dbAdapter.delete('companies', { id });
      
      await loadCompanies();
    } catch (err) {
      console.error('Error deleting company:', err);
      setError('Failed to delete company. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">PostgreSQL Test Page</h1>
      
      <DatabaseConnectionStatus />
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Database Connection Status</h2>
        
        <div className="mb-4">
          <p className="mb-2">
            <span className="font-medium">Current Database Mode:</span>{' '}
            <span className={`px-2 py-1 rounded ${databaseMode === 'postgres' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
              {databaseMode === 'postgres' ? 'PostgreSQL' : 'Supabase'}
            </span>
          </p>
          
          <p className="mb-2">
            <span className="font-medium">Connection Status:</span>{' '}
            {connectionStatus === 'loading' && <span className="text-yellow-600">Testing connection...</span>}
            {connectionStatus === 'success' && <span className="text-green-600">Connected successfully</span>}
            {connectionStatus === 'error' && <span className="text-red-600">Connection failed</span>}
          </p>
          
          {connectionTime && (
            <p className="mb-2">
              <span className="font-medium">Server Time:</span> {connectionTime}
            </p>
          )}
          
          <button
            onClick={testConnection}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Test Connection
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Companies</h2>
            
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p>{error}</p>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Create New Company</h3>
              <div className="flex">
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="Company Name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleCreateCompany}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-2">Company List</h3>
            {loading ? (
              <p>Loading companies...</p>
            ) : companies.length === 0 ? (
              <p>No companies found.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {companies.map((company) => (
                  <li key={company.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{company.company_name}</p>
                      <p className="text-sm text-gray-500">{company.address}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCompany(company.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Equipment</h2>
            
            {equipment.length === 0 ? (
              <p>No equipment found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {equipment.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.serial_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.equipment_type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.company_name}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 