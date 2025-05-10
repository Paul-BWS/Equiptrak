const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.VITE_POSTGRES_USER || 'testuser',
  password: process.env.VITE_POSTGRES_PASSWORD || 'testpass',
  host: process.env.VITE_POSTGRES_HOST || '185.25.144.64',
  port: parseInt(process.env.VITE_POSTGRES_PORT || '5432'),
  database: process.env.VITE_POSTGRES_DB || 'equiptrak',
  ssl: false
});

async function createProductsTable() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    console.log('Creating products table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        shopify_product_id TEXT NOT NULL UNIQUE,
        shopify_variant_id TEXT,
        name TEXT NOT NULL,
        sku TEXT,
        price DECIMAL(10, 2) DEFAULT 0.00,
        compare_at_price DECIMAL(10, 2),
        handle TEXT,
        description TEXT,
        image_url TEXT,
        taxable BOOLEAN DEFAULT true,
        inventory_quantity INTEGER DEFAULT 0,
        category TEXT,
        supplier TEXT,
        ean TEXT,
        commodity_code TEXT,
        weight DECIMAL(10, 2),
        weight_unit TEXT,
        length DECIMAL(10, 2),
        width DECIMAL(10, 2),
        height DECIMAL(10, 2),
        cost_price DECIMAL(10, 2),
        trade_price DECIMAL(10, 2),
        list_price DECIMAL(10, 2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Products table created successfully!');
    
    // Check if the table was created
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'products'
      );
    `);
    
    const tableExists = result.rows[0].exists;
    console.log(`Table exists: ${tableExists}`);
    
    // Release the client back to the pool
    client.release();
    
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating products table:', error);
    process.exit(1);
  }
}

createProductsTable(); 