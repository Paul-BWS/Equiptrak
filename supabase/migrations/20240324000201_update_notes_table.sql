-- This migration is for updating an existing notes table
-- It will drop existing policies and recreate them

-- First, check if the notes table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notes') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Admins can see all notes" ON notes;
    DROP POLICY IF EXISTS "Users can see notes for their company" ON notes;
    DROP POLICY IF EXISTS "Admins can insert notes" ON notes;
    DROP POLICY IF EXISTS "Users can insert notes for their company" ON notes;
    DROP POLICY IF EXISTS "Admins can update notes" ON notes;
    DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
    DROP POLICY IF EXISTS "Admins can delete notes" ON notes;
    DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;
    
    -- Enable RLS if not already enabled
    ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
    
    -- Create new policies
    CREATE POLICY "Admins can see all notes" ON notes
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
      );
    
    CREATE POLICY "Users can see notes for their company" ON notes
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_user_meta_data->>'company_id' = company_id::text
        )
      );
    
    CREATE POLICY "Admins can insert notes" ON notes
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
      );
    
    CREATE POLICY "Users can insert notes for their company" ON notes
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_user_meta_data->>'company_id' = company_id::text
        )
      );
    
    CREATE POLICY "Admins can update notes" ON notes
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
      );
    
    CREATE POLICY "Users can update their own notes" ON notes
      FOR UPDATE
      USING (
        created_by = auth.uid()
      );
    
    CREATE POLICY "Admins can delete notes" ON notes
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
      );
    
    CREATE POLICY "Users can delete their own notes" ON notes
      FOR DELETE
      USING (
        created_by = auth.uid()
      );
  END IF;
END
$$; 