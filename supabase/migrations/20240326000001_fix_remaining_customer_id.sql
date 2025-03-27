-- Drop any remaining customer_id constraints and indexes
ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_customer_id_fkey;
DROP INDEX IF EXISTS idx_equipment_customer_id;

-- Ensure company_id column exists and has correct constraints
DO $$ 
BEGIN
    -- Check if company_id column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'equipment' 
        AND column_name = 'company_id'
    ) THEN
        -- If company_id doesn't exist but customer_id does, rename it
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'equipment' 
            AND column_name = 'customer_id'
        ) THEN
            ALTER TABLE equipment RENAME COLUMN customer_id TO company_id;
        -- If neither exists, add company_id
        ELSE
            ALTER TABLE equipment ADD COLUMN company_id UUID;
        END IF;
    END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
ALTER TABLE equipment 
    DROP CONSTRAINT IF EXISTS equipment_company_id_fkey,
    ADD CONSTRAINT equipment_company_id_fkey 
    FOREIGN KEY (company_id) 
    REFERENCES companies(id) 
    ON DELETE CASCADE;

-- Create index for company_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_equipment_company_id ON equipment(company_id);

-- Update any null company_ids from related service records
UPDATE equipment e
SET company_id = (
    SELECT company_id 
    FROM service_records sr 
    WHERE sr.equipment_id = e.id 
    LIMIT 1
)
WHERE e.company_id IS NULL;

-- Verify and fix any remaining issues
DO $$ 
BEGIN
    -- Check for any remaining customer_id columns
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'equipment' 
        AND column_name = 'customer_id'
    ) THEN
        RAISE EXCEPTION 'customer_id column still exists in equipment table';
    END IF;
END $$; 