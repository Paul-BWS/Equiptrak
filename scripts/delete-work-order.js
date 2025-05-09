import pg from 'pg';
const { Pool } = pg;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.VITE_POSTGRES_USER || 'testuser',
  password: process.env.VITE_POSTGRES_PASSWORD || 'testpass',
  host: process.env.VITE_POSTGRES_HOST || '185.25.144.64',
  port: parseInt(process.env.VITE_POSTGRES_PORT || '5432'),
  database: process.env.VITE_POSTGRES_DB || 'equiptrak',
  ssl: false
});

async function deleteWorkOrder() {
  const client = await pool.connect();
  
  try {
    console.log('Starting deletion process...');
    
    // Start transaction
    await client.query('BEGIN');

    // First delete any related items
    console.log('Deleting related items for work order ID 2...');
    await client.query('DELETE FROM work_order_items WHERE work_order_id = $1', [2]);

    // Then delete the work order
    console.log('Deleting work order ID 2...');
    await client.query('DELETE FROM work_orders WHERE id = $1', [2]);

    await client.query('COMMIT');
    console.log('Successfully deleted work order and its items');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting work order:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
deleteWorkOrder()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 