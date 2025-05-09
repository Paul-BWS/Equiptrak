require('dotenv-safe').config({
  allowEmptyValues: true,
  path: require('path').resolve(__dirname, '../.env'),
  example: require('path').resolve(__dirname, '../.env.example')
});

const { Pool } = require('pg');

// Initialize PostgreSQL connection pool with the same config as the server
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Updating work_orders table...');
    
    // Start a transaction
    await client.query('BEGIN');

    // Add work_order_number and make job_tracker optional
    await client.query(`
      ALTER TABLE work_orders 
      ADD COLUMN IF NOT EXISTS work_order_number VARCHAR(20) UNIQUE,
      ALTER COLUMN job_tracker DROP NOT NULL;
    `);

    // Create sequence for work order numbers
    await client.query(`
      CREATE SEQUENCE IF NOT EXISTS work_order_number_seq START 1000;
    `);

    // Create function to generate work order numbers
    await client.query(`
      CREATE OR REPLACE FUNCTION generate_work_order_number()
      RETURNS VARCHAR(20) AS $$
      DECLARE
        next_number INTEGER;
        work_order_number VARCHAR(20);
      BEGIN
        SELECT nextval('work_order_number_seq') INTO next_number;
        work_order_number := 'WO-' || LPAD(next_number::TEXT, 5, '0');
        RETURN work_order_number;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Add quickbooks_ref field
    await client.query(`
      ALTER TABLE work_orders 
      ADD COLUMN IF NOT EXISTS quickbooks_ref VARCHAR(50);
    `);

    // Add indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_work_orders_work_order_number ON work_orders(work_order_number);
    `);

    // Commit the transaction
    await client.query('COMMIT');
    
    console.log('Successfully updated work_orders table');
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration().catch(console.error); 