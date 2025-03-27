-- Add the necessary equipment fields to service_records table
ALTER TABLE service_records 
  ADD COLUMN IF NOT EXISTS equipment1_name TEXT,
  ADD COLUMN IF NOT EXISTS equipment1_serial TEXT,
  ADD COLUMN IF NOT EXISTS equipment2_name TEXT,
  ADD COLUMN IF NOT EXISTS equipment2_serial TEXT,
  ADD COLUMN IF NOT EXISTS equipment3_name TEXT,
  ADD COLUMN IF NOT EXISTS equipment3_serial TEXT,
  ADD COLUMN IF NOT EXISTS equipment4_name TEXT,
  ADD COLUMN IF NOT EXISTS equipment4_serial TEXT,
  ADD COLUMN IF NOT EXISTS equipment5_name TEXT,
  ADD COLUMN IF NOT EXISTS equipment5_serial TEXT,
  ADD COLUMN IF NOT EXISTS equipment6_name TEXT,
  ADD COLUMN IF NOT EXISTS equipment6_serial TEXT,
  ADD COLUMN IF NOT EXISTS equipment7_name TEXT,
  ADD COLUMN IF NOT EXISTS equipment7_serial TEXT,
  ADD COLUMN IF NOT EXISTS equipment8_name TEXT,
  ADD COLUMN IF NOT EXISTS equipment8_serial TEXT,
  ADD COLUMN IF NOT EXISTS retest_date TIMESTAMP WITH TIME ZONE;

-- Create indexes to improve performance
CREATE INDEX IF NOT EXISTS idx_service_records_retest_date ON service_records(retest_date);

-- Fix the service_date NOT NULL constraint if it exists
ALTER TABLE service_records ALTER COLUMN service_date DROP NOT NULL;

-- OUT WITH THE OLD, IN WITH THE NEW
-- Add a new column for engineer_name if it doesn't exist
ALTER TABLE service_records ADD COLUMN IF NOT EXISTS engineer_name TEXT;

-- Copy any existing engineer_id values to engineer_name
UPDATE service_records SET engineer_name = engineer_id WHERE engineer_id IS NOT NULL AND engineer_name IS NULL;

-- Drop the engineer_id column 
ALTER TABLE service_records DROP COLUMN IF EXISTS engineer_id;

-- Add a comment explaining the engineer_name column
COMMENT ON COLUMN service_records.engineer_name IS 'Name of the engineer who performed the service'; 