import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// IMPORTANT: This file should only be used in server-side contexts
// The service role key should never be exposed to the client

// Use environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// This client should ONLY be used in server-side functions, never in client code
// For client-side operations, use the client.ts file instead
export const createAdminClient = () => {
  // This is a placeholder function that should be called only from server-side code
  console.error(
    'WARNING: Attempted to create admin client in browser context. ' +
    'This is a security risk and should never happen.'
  );
  
  // Return the regular client instead of the admin client for safety
  return null;
}; 