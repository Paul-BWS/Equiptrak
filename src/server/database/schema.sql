-- Images table for storing image metadata
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL, -- 'companies', 'equipment', 'signatures', etc.
  entity_id UUID NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL,
  UNIQUE (entity_type, entity_id)
);

-- Index for faster queries on entity_type and entity_id
CREATE INDEX IF NOT EXISTS idx_images_entity ON images(entity_type, entity_id);

-- Add logo_url column to companies table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE companies ADD COLUMN logo_url VARCHAR(255);
  END IF;
END $$; 