-- Drop all constraints and policies first
ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_customer_id_fkey;
DROP POLICY IF EXISTS "equipment_policy" ON equipment;
DROP POLICY IF EXISTS "equipment_select_policy" ON equipment;
DROP POLICY IF EXISTS "equipment_access_policy" ON equipment;

-- Rename customer_id to company_id
ALTER TABLE equipment RENAME COLUMN customer_id TO company_id;

-- Add foreign key constraint
ALTER TABLE equipment 
    ADD CONSTRAINT equipment_company_id_fkey 
    FOREIGN KEY (company_id) 
    REFERENCES companies(id)
    ON DELETE CASCADE;

-- Create index for better performance
DROP INDEX IF EXISTS idx_equipment_customer_id;
CREATE INDEX idx_equipment_company_id ON equipment(company_id);

-- Disable RLS
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON equipment TO authenticated; 