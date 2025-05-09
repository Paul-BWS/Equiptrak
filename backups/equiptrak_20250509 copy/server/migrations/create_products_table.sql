CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    shopify_product_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    price DECIMAL(10,2),
    description TEXT,
    inventory_quantity INTEGER DEFAULT 0,
    category VARCHAR(100),
    supplier VARCHAR(100),
    cost_price DECIMAL(10,2),
    trade_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 