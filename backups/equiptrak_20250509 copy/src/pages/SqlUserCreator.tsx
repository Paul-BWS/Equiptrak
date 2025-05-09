import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check } from 'lucide-react';

export default function SqlUserCreator() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [companyName, setCompanyName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate a secure random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  // Generate SQL for user creation
  const generateSql = () => {
    if (!email || !password || !name) {
      alert('Email, password, and name are required');
      return;
    }

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
  };

  // Copy SQL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="flex items-center mb-6">
        <Link to="/admin" className="flex items-center text-blue-600 hover:text-blue-800 mr-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Admin
        </Link>
        <h1 className="text-2xl font-bold">SQL User Creator</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">User Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-l-md"
                required
              />
              <button
                onClick={generatePassword}
                className="bg-gray-200 px-3 rounded-r-md hover:bg-gray-300"
                type="button"
              >
                Generate
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telephone
            </label>
            <input
              type="text"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <button
          onClick={generateSql}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Generate SQL
        </button>
      </div>
      
      {sqlQuery && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">SQL Query</h2>
            <button
              onClick={copyToClipboard}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy to Clipboard
                </>
              )}
            </button>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            <pre className="text-sm whitespace-pre-wrap">{sqlQuery}</pre>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <h3 className="font-medium mb-2">Instructions:</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Copy the SQL query above</li>
              <li>Go to the Supabase dashboard for your project</li>
              <li>Navigate to the SQL Editor</li>
              <li>Paste the query and run it</li>
              <li>The user will be created with the specified details</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
} 