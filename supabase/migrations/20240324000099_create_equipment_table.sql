-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    serial_number TEXT NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    type TEXT,
    next_test_date TIMESTAMP WITH TIME ZONE,
    last_test_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_equipment_company_id ON equipment(company_id);
CREATE INDEX idx_equipment_type ON equipment(type);

-- No RLS needed
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON equipment TO authenticated; 