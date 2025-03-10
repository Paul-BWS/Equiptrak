-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE
);

-- Add RLS policies
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policy for admins (can see all notes)
CREATE POLICY IF NOT EXISTS "Admins can see all notes" ON notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy for users (can only see notes for their company)
CREATE POLICY IF NOT EXISTS "Users can see notes for their company" ON notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'company_id' = company_id::text
    )
  );

-- Policy for admins (can insert notes)
CREATE POLICY IF NOT EXISTS "Admins can insert notes" ON notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy for users (can insert notes for their company)
CREATE POLICY IF NOT EXISTS "Users can insert notes for their company" ON notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'company_id' = company_id::text
    )
  );

-- Policy for admins (can update notes)
CREATE POLICY IF NOT EXISTS "Admins can update notes" ON notes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy for users (can update their own notes)
CREATE POLICY IF NOT EXISTS "Users can update their own notes" ON notes
  FOR UPDATE
  USING (
    created_by = auth.uid()
  );

-- Policy for admins (can delete notes)
CREATE POLICY IF NOT EXISTS "Admins can delete notes" ON notes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy for users (can delete their own notes)
CREATE POLICY IF NOT EXISTS "Users can delete their own notes" ON notes
  FOR DELETE
  USING (
    created_by = auth.uid()
  );

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION update_notes_updated_at(); 