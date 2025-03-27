-- This migration focuses solely on fixing the engineer field issue
-- First make sure engineer_name exists
ALTER TABLE service_records ADD COLUMN IF NOT EXISTS engineer_name TEXT;

-- Copy any data from engineer_id to engineer_name if engineer_name is null
UPDATE service_records 
SET engineer_name = CAST(engineer_id AS TEXT) 
WHERE engineer_id IS NOT NULL AND engineer_name IS NULL;

-- Forcibly drop the engineer_id column (CASCADE to ensure any dependencies are also removed)
ALTER TABLE service_records DROP COLUMN IF EXISTS engineer_id CASCADE;

-- Add a comment explaining the engineer_name column
COMMENT ON COLUMN service_records.engineer_name IS 'Name of the engineer who performed the service'; 