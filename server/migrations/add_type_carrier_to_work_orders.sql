-- Add type and carrier columns to work_orders table
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS type VARCHAR(50),
ADD COLUMN IF NOT EXISTS carrier VARCHAR(100);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_work_orders_type ON work_orders(type);
CREATE INDEX IF NOT EXISTS idx_work_orders_carrier ON work_orders(carrier); 