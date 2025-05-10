const { Pool } = require('pg');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.VITE_POSTGRES_USER || 'testuser',
  password: process.env.VITE_POSTGRES_PASSWORD || 'testpass',
  host: process.env.VITE_POSTGRES_HOST || '185.25.144.64',
  port: parseInt(process.env.VITE_POSTGRES_PORT || '5432'),
  database: process.env.VITE_POSTGRES_DB || 'equiptrak',
  ssl: false
});

async function addTypeAndCarrierColumns() {
  const client = await pool.connect();
  
  try {
    console.log('Adding type and carrier columns to work_orders table...');
    
    // Start transaction
    await client.query('BEGIN');

    // Add type and carrier columns
    await client.query(`
      ALTER TABLE work_orders 
      ADD COLUMN IF NOT EXISTS type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS carrier VARCHAR(100);
    `);

    // Add indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_work_orders_type ON work_orders(type);
      CREATE INDEX IF NOT EXISTS idx_work_orders_carrier ON work_orders(carrier);
    `);

    // Commit the transaction
    await client.query('COMMIT');
    
    console.log('Successfully added type and carrier columns to work_orders table');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the migration
addTypeAndCarrierColumns().catch(console.error); 