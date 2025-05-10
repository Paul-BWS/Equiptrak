import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function AdminUserCreate() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [companyName, setCompanyName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');

  function generateSql() {
    const sql = `
-- Disable the trigger temporarily
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- Create a user
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- Insert the user
  INSERT INTO auth.users (
    instance_id,
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud,
    raw_app_meta_data,
    raw_user_meta_data
  )
  VALUES (
    (SELECT id FROM auth.instances LIMIT 1),
    new_user_id,
    '${email}',
    auth.crypt('${password}', auth.gen_salt('bf')),
    now(),
    now(),
    now(),
    'authenticated',
    'authenticated',
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"role": "${role}", "name": "${name}", "company_name": "${companyName}", "telephone": "${telephone}"}'::jsonb
  );

  -- Insert the profile
  INSERT INTO public.profiles (
    id,
    role,
    email,
    name,
    company_name,
    telephone
  )
  VALUES (
    new_user_id,
    '${role}',
    '${email}',
    '${name}',
    '${companyName}',
    '${telephone}'
  );
  
  RAISE NOTICE 'Created user with ID: %', new_user_id;
END $$;

-- Re-enable the trigger
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;
    `;
    
    setSqlQuery(sql);
  }

  async function handleDirectSignup() {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Use the standard Supabase signUp method
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            company_name: companyName,
            telephone
          }
        }
      });
      
      if (error) throw error;
      
      setSuccess(`User created successfully! Email: ${email}`);
      console.log('User created:', data);
    } catch (err) {
      setError(err.message);
      console.error('Error creating user:', err);
      // Generate SQL as fallback
      generateSql();
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    generateSql();
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin: Create User</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>
        
        <div>
          <label className="block">Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full"
            required
            minLength={8}
          />
        </div>
        
        <div>
          <label className="block">Name:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>
        
        <div>
          <label className="block">Role:</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <div>
          <label className="block">Company Name:</label>
          <input 
            type="text" 
            value={companyName} 
            onChange={(e) => setCompanyName(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        
        <div>
          <label className="block">Telephone:</label>
          <input 
            type="text" 
            value={telephone} 
            onChange={(e) => setTelephone(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={handleDirectSignup}
            className="bg-blue-500 text-white p-2 rounded"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create User Directly'}
          </button>
          
          <button 
            type="submit" 
            className="bg-gray-500 text-white p-2 rounded"
          >
            Generate SQL
          </button>
        </div>
      </form>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
          <p className="font-bold">Success:</p>
          <p>{success}</p>
        </div>
      )}
      
      {sqlQuery && (
        <div className="mt-4">
          <p className="font-bold">Copy this SQL and run it in the Supabase SQL Editor:</p>
          <pre className="p-4 bg-gray-100 rounded overflow-x-auto mt-2">
            {sqlQuery}
          </pre>
          <button
            onClick={() => {
              navigator.clipboard.writeText(sqlQuery);
              alert('SQL copied to clipboard!');
            }}
            className="mt-2 bg-gray-500 text-white p-2 rounded"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
} 