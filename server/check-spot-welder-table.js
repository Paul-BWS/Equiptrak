/**
 * Run this script to check if the spot_welder_records table exists
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkSpotWelderTable() {
  const client = await pool.connect();
  
  try {
    console.log('Checking for spot_welder_records table...');
    
    // Check if table exists
    const checkTableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'spot_welder_records'
      );
    `);
    
    const tableExists = checkTableResult.rows[0].exists;
    
    if (tableExists) {
      console.log('spot_welder_records table exists.');
      
      // Check table structure
      const columnsResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'spot_welder_records'
        ORDER BY ordinal_position;
      `);
      
      console.log('\nTable structure:');
      columnsResult.rows.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type}`);
      });
      
      // Count records
      const countResult = await client.query('SELECT COUNT(*) FROM spot_welder_records');
      console.log(`\nTotal records: ${countResult.rows[0].count}`);
      
    } else {
      console.log('spot_welder_records table does not exist.');
      console.log('Run create-spot-welder-table.js to create the table.');
    }
    
  } catch (error) {
    console.error('Error checking spot_welder_records table:', error);
  } finally {
    client.release();
    // Close the pool
    await pool.end();
  }
}

// Run the check
checkSpotWelderTable(); 