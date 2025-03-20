// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Helper function to make API calls
async function apiCall<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T[]> {
  console.log(`Making API call to: ${endpoint}, method: ${method}`);
  
  // Make sure endpoint starts with a slash
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  try {
    const response = await fetch(`http://localhost:3001/api${normalizedEndpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed (${response.status}): ${errorText}`);
      throw new Error(errorText || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(`API response for ${endpoint}:`, data);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    // Return empty array instead of throwing to prevent UI crashes
    return [] as T[];
  }
}

// Database interface
const db = {
  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    console.log(`DB Query: ${text}`, params);
    
    try {
      // If it's a SELECT query
      if (text.toLowerCase().trim().startsWith('select')) {
        // For companies table, use a direct API call
        if (text.toLowerCase().includes('from companies')) {
          console.log('Making direct API call to /companies endpoint');
          const result = await apiCall<T>('/companies');
          console.log('Companies API result:', result);
          return result;
        }
        
        // Parse the table name from the query
        const tableMatch = text.toLowerCase().match(/from\s+(\w+)/);
        if (!tableMatch) {
          throw new Error('Invalid query format');
        }
        const table = tableMatch[1];
        console.log(`Parsed table name: ${table}`);
        
        // Convert SQL query to API endpoint
        let endpoint = `/${table}`;
        
        // Handle WHERE conditions
        const whereMatch = text.toLowerCase().match(/where\s+(.*?)(\s+order\s+by|$)/);
        if (whereMatch) {
          const conditions = whereMatch[1];
          const queryParams = new URLSearchParams();
          
          // Parse conditions and add to query params
          conditions.split('and').forEach((condition, index) => {
            const [column, operator, placeholder] = condition.trim().split(/\s+/);
            if (params && params[index] !== undefined) {
              queryParams.append(column, params[index]);
            }
          });
          
          if (queryParams.toString()) {
            endpoint += `?${queryParams.toString()}`;
          }
        }
        
        console.log(`Converted SQL query to API endpoint: ${endpoint}`);
        return apiCall<T>(endpoint);
      }
      
      // If it's an INSERT query
      if (text.toLowerCase().trim().startsWith('insert')) {
        const tableMatch = text.toLowerCase().match(/into\s+(\w+)/);
        if (!tableMatch) {
          throw new Error('Invalid query format');
        }
        const table = tableMatch[1];
        
        return apiCall<T>(`/${table}`, 'POST', params ? params[0] : undefined);
      }
      
      // If it's an UPDATE query
      if (text.toLowerCase().trim().startsWith('update')) {
        const tableMatch = text.toLowerCase().match(/update\s+(\w+)/);
        if (!tableMatch) {
          throw new Error('Invalid query format');
        }
        const table = tableMatch[1];
        
        // Extract ID from WHERE clause
        const whereMatch = text.toLowerCase().match(/where\s+id\s*=\s*\$\d+/);
        if (!whereMatch || !params) {
          throw new Error('Invalid update query format');
        }
        const id = params[params.length - 1];
        
        return apiCall<T>(`/${table}/${id}`, 'PUT', params ? params[0] : undefined);
      }
      
      // If it's a DELETE query
      if (text.toLowerCase().trim().startsWith('delete')) {
        const tableMatch = text.toLowerCase().match(/from\s+(\w+)/);
        if (!tableMatch) {
          throw new Error('Invalid query format');
        }
        const table = tableMatch[1];
        
        // Extract ID from WHERE clause
        const whereMatch = text.toLowerCase().match(/where\s+id\s*=\s*\$\d+/);
        if (!whereMatch || !params) {
          throw new Error('Invalid delete query format');
        }
        const id = params[0];
        
        return apiCall<T>(`/${table}/${id}`, 'DELETE');
      }
      
      throw new Error('Unsupported query type');
    } catch (error) {
      console.error('Error in db.query:', error);
      throw error;
    }
  }
};

export default db; 