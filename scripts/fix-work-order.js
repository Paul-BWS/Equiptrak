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

async function fixWorkOrder() {
  const client = await pool.connect();
  
  try {
    console.log('Looking for work order with job tracker JOB-025555...');
    
    // Find the work order
    const result = await client.query(`
      SELECT 
        wo.id,
        wo.work_order_number,
        wo.company_id,
        c.company_name,
        wo.status,
        wo.date,
        wo.job_tracker
      FROM work_orders wo
      LEFT JOIN companies c ON wo.company_id = c.id
      WHERE wo.job_tracker = $1
    `, ['JOB-025555']);

    if (result.rows.length === 0) {
      console.log('Work order not found');
      return;
    }

    const workOrder = result.rows[0];
    console.log('\nFound work order:');
    console.log(`ID: ${workOrder.id}`);
    console.log(`Work Order Number: ${workOrder.work_order_number}`);
    console.log(`Company: ${workOrder.company_name} (${workOrder.company_id})`);
    console.log(`Status: ${workOrder.status}`);
    console.log(`Date: ${workOrder.date}`);
    console.log(`Job Tracker: ${workOrder.job_tracker}`);

    // Start transaction to fix the work order
    await client.query('BEGIN');

    // Generate a new work order number
    const workOrderNumberResult = await client.query('SELECT generate_work_order_number()');
    const newWorkOrderNumber = workOrderNumberResult.rows[0].generate_work_order_number;

    console.log(`\nGenerating new work order number: ${newWorkOrderNumber}`);

    // Update the work order with the new number
    await client.query(`
      UPDATE work_orders 
      SET work_order_number = $1,
          updated_at = NOW()
      WHERE id = $2
    `, [newWorkOrderNumber, workOrder.id]);

    await client.query('COMMIT');
    console.log('Successfully fixed work order');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error fixing work order:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
fixWorkOrder()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 