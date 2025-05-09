CREATE TABLE IF NOT EXISTS work_orders (
    id SERIAL PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    work_order_number VARCHAR(20) UNIQUE NOT NULL,
    job_tracker VARCHAR(50) NULL,
    date DATE NOT NULL,
    order_number VARCHAR(50),
    taken_by VARCHAR(100),
    staff VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    description TEXT,
    internal_notes TEXT,
    quickbooks_ref VARCHAR(50),
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    vat_rate DECIMAL(5,2) NOT NULL DEFAULT 20,
    vat DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sequence for work order numbers
CREATE SEQUENCE IF NOT EXISTS work_order_number_seq START 1000;

-- Function to generate the next work order number
CREATE OR REPLACE FUNCTION generate_work_order_number()
RETURNS VARCHAR(20) AS $$
DECLARE
    next_number INTEGER;
    work_order_number VARCHAR(20);
BEGIN
    -- Get the next number from the sequence
    SELECT nextval('work_order_number_seq') INTO next_number;
    
    -- Format as WO-XXXXX (padded with zeros)
    work_order_number := 'WO-' || LPAD(next_number::TEXT, 5, '0');
    
    RETURN work_order_number;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS work_order_items (
    id SERIAL PRIMARY KEY,
    work_order_id INTEGER NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    sku VARCHAR(100),
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_work_orders_company_id ON work_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_date ON work_orders(date);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_work_order_number ON work_orders(work_order_number);
CREATE INDEX IF NOT EXISTS idx_work_order_items_work_order_id ON work_order_items(work_order_id); 