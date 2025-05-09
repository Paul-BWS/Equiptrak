import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { UserFormModal } from '@/components/users/UserFormModal';

// Define types for our data
interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  company_name?: string;
  telephone?: string;
}

export default function UserManagementPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<string[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [serverStatus, setServerStatus] = useState<{ online: boolean; message: string } | null>(null);
  const [serverStatusLoading, setServerStatusLoading] = useState(false);

  // Check server status on component mount
  useEffect(() => {
    checkServerStatus();
  }, []);

  // Update the proxy function to use Supabase directly
  const proxyServerRequest = async (endpoint: string, options: RequestInit = {}) => {
    console.log(`Making request to Supabase for: ${endpoint}`);
    
    try {
      // This is a placeholder - the actual implementation will depend on what
      // the endpoint is trying to do. You'll need to replace this with the
      // appropriate Supabase API calls.
      
      // For example, if this was fetching users:
      if (endpoint.includes('list-users')) {
        const { data, error } = await supabase.from('profiles').select('*');
        
        if (error) throw error;
        
        // Create a mock response object that matches the expected interface
        return {
          ok: true,
          json: async () => ({ users: data }),
          status: 200,
          statusText: 'OK'
        } as Response;
      }
      
      // For other endpoints, return a mock response
      console.warn('proxyServerRequest needs to be updated for endpoint:', endpoint);
      return {
        ok: true,
        json: async () => ({ message: 'Supabase connection successful' }),
        status: 200,
        statusText: 'OK'
      } as Response;
    } catch (error) {
      console.error('Error making request:', error);
      throw error;
    }
  };

  // Update the checkServerStatus function to be more robust
  const checkServerStatus = async () => {
    setServerStatusLoading(true);
    setServerStatus(null);
    setError(null); // Clear any existing errors
    
    try {
      console.log('Checking server status...');
      
      // Try multiple endpoints with different approaches
      const endpoints = [
        '/api-proxy/api/test',
        '/api-proxy/api/test-json',
        'http://localhost:3003/api/test',
        'http://127.0.0.1:3003/api/test'
      ];
      
      let serverReachable = false;
      let responseData = null;
      let successfulEndpoint = '';
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          
          // Use a simple fetch with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const response = await fetch(endpoint, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              responseData = await response.json();
              serverReachable = true;
              successfulEndpoint = endpoint;
              console.log('Server is reachable at:', endpoint);
              console.log('Response:', responseData);
              break;
            } else {
              console.log(`Endpoint ${endpoint} returned non-JSON response:`, contentType);
            }
          } else {
            console.log(`Endpoint ${endpoint} returned status:`, response.status);
          }
        } catch (endpointError) {
          console.log(`Endpoint ${endpoint} failed:`, endpointError);
          // Continue to next endpoint
        }
      }
      
      if (serverReachable) {
        setServerStatus({ 
          online: true, 
          message: `Server is online (${responseData?.nodeVersion || 'unknown version'})` 
        });
        
        // If server is online, try to fetch users
        fetchUsers();
      } else {
        setServerStatus({ 
          online: false, 
          message: 'Unable to connect to Supabase' 
        });
        setError(`Unable to connect to Supabase. Please check your internet connection and Supabase configuration.`);
      }
    } catch (error) {
      console.error('Error checking server status:', error);
      setServerStatus({ 
        online: false, 
        message: `Error checking server status: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
      setError(`Server connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setServerStatusLoading(false);
    }
  };

  // Update the fetchUsers function to use the proxy
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching users...');
      
      // Use the proxy function to make the request
      const response = await proxyServerRequest('api/list-users');
      
      // Log response details for debugging
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('The list-users endpoint was not found on the server. Please check that the server is running the latest code.');
        }
        
        // Try to get error details from response
        let errorText;
        try {
          const errorData = await response.json();
          errorText = errorData.error || `Server returned ${response.status}`;
        } catch {
          errorText = `Server returned ${response.status}`;
        }
        
        throw new Error(errorText);
      }
      
      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        
        // Try to read the response as text for debugging
        const responseText = await response.text();
        console.error('Raw response:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
        
        throw new Error('Server did not return JSON data. Received: ' + contentType);
      }
      
      const data = await response.json();
      console.log('Users data received:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error from server');
      }
      
      if (!data.users || !Array.isArray(data.users)) {
        throw new Error('Server returned invalid data format');
      }
      
      setUsers(data.users);
      
      // Extract available columns from the first user
      if (data.users.length > 0) {
        const firstUser = data.users[0];
        setAvailableColumns(Object.keys(firstUser));
        
        // Extract unique company names for filtering
        const uniqueCompanies = [...new Set(data.users
          .map(user => user.company_name)
          .filter(Boolean))] as string[];
        setCompanies(uniqueCompanies);
      } else {
        setAvailableColumns(['id', 'email', 'name', 'role', 'company_name']);
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(`Error Loading Users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on selected filters
  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesCompany = companyFilter === "all" || user.company_name === companyFilter;
    return matchesRole && matchesCompany;
  });

  // Open modal to add a new user
  const handleAddUser = () => {
    setCurrentUser(null); // Reset current user for add mode
    setIsModalOpen(true);
  };

  // Open modal to edit an existing user
  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  // Update the handleDeleteUser function to use the proxy
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      // Delete user via server endpoint using the proxy
      const response = await proxyServerRequest('api/delete-user', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      
      // Update the UI
      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting user:', error.message);
      toast({
        title: 'Error',
        description: `Failed to delete user: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  // Close the modal and refresh users if needed
  const handleModalClose = (refreshNeeded: boolean) => {
    setIsModalOpen(false);
    if (refreshNeeded) {
      fetchUsers();
    }
  };

  // Determine if we should show the company column
  const showCompanyColumn = availableColumns.includes('company_name');
  const showNameColumn = availableColumns.includes('name');
  const showTelephoneColumn = availableColumns.includes('telephone');

  // Update the error display to provide more helpful troubleshooting information
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="p-4 mb-4 border border-red-300 bg-red-50 rounded-md">
          <h3 className="text-lg font-medium text-red-800">Error Loading Users</h3>
          <p className="mt-1 text-red-700">{error}</p>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-medium text-blue-800">Server Connection Test</h4>
            <p className="mt-1 text-blue-700">
              Use our diagnostic tool to check server connectivity:
            </p>
            <a 
              href="/test-server" 
              target="_blank" 
              className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Open Server Test Page
            </a>
          </div>
          
          <div className="mt-3">
            <h4 className="font-medium text-red-800">Troubleshooting Steps:</h4>
            <ol className="list-decimal pl-5 mt-1 text-red-700 space-y-1">
              <li>Check your internet connection</li>
              <li>Verify that your Supabase project is online at <a href="https://app.supabase.com" target="_blank" className="underline">https://app.supabase.com</a></li>
              <li>Ensure your <code className="bg-red-100 px-1 rounded">.env</code> file has the correct Supabase URL and API keys</li>
              <li>Check the browser console for specific error messages</li>
              <li>Try refreshing the page or signing out and back in</li>
            </ol>
          </div>
          
          <div className="mt-4 flex space-x-3">
            <button
              onClick={checkServerStatus}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              disabled={serverStatusLoading}
            >
              {serverStatusLoading ? 'Checking...' : 'Check Server Status'}
            </button>
            <button
              onClick={fetchUsers}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={handleAddUser} className="bg-green-500 hover:bg-green-600">
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>
      
      <div className="flex gap-4 mb-6">
        <div className="w-1/4">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {showCompanyColumn && companies.length > 0 && (
          <div className="w-1/4">
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              {showNameColumn && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              {showCompanyColumn && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
              )}
              {showTelephoneColumn && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telephone
                </th>
              )}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.email}
                  </td>
                  {showNameColumn && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.name || '-'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  {showCompanyColumn && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.company_name || '-'}
                    </td>
                  )}
                  {showTelephoneColumn && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.telephone || '-'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {isModalOpen && (
        <UserFormModal
          user={currentUser}
          open={isModalOpen}
          onClose={handleModalClose}
          companies={companies}
        />
      )}
    </div>
  );
} 