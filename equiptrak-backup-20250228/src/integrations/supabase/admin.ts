import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://wifnmyqetprcrfqnxrnn.supabase.co";
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZm5teXFldHByY3JmcW54cm5uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwODc5NjQwMiwiZXhwIjoyMDI0MzcyNDAyfQ.aqvn_1oRfHEQZxOPQlwJXn-7LPvKPGXBPYDHGDLPFUY";

// Create Supabase admin client with service role
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
}); 