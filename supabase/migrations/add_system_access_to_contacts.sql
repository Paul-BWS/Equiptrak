-- Add has_system_access and role columns to contacts table
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS has_system_access BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS role TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contacts_has_system_access ON contacts(has_system_access); 