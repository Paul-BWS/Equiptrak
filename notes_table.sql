-- Simple notes table creation script for Supabase SQL Editor

-- Create notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it exists
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON notes;

-- Create a single policy for all operations
CREATE POLICY "Allow all operations for authenticated users" ON notes
  FOR ALL
  USING (true)
  WITH CHECK (true); 