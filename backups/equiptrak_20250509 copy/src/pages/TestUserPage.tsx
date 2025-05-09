import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function TestUserPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const createUser = async () => {
    if (!email || !password) {
      setMessage('Email and password are required');
      return;
    }
    
    setIsLoading(true);
    setMessage('Creating user...');
    
    try {
      // Use Supabase directly to create a user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setMessage(`User created successfully: ${data.user?.email}`);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const signIn = async () => {
    if (!email || !password) {
      setMessage('Email and password are required');
      return;
    }
    
    setIsLoading(true);
    setMessage('Signing in...');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      setMessage(`Signed in successfully as: ${data.user.email}`);
    } catch (error: any) {
      setMessage(`Error signing in: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Test User Creation and Login</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={createUser}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Create User
          </button>
          
          <button
            onClick={signIn}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign In
          </button>
        </div>
        
        {message && (
          <div className={`p-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
} 