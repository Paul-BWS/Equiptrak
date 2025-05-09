// Simple script to fix the engineer field in the database
require('dotenv').config();
const { Pool } = require('pg');

// Create a new database client using the same connection details as the API
const pool = new Pool({
  user: process.env.VITE_POSTGRES_USER || 'testuser',
  password: process.env.VITE_POSTGRES_PASSWORD || 'testpass',
  host: process.env.VITE_POSTGRES_HOST || '185.25.144.64', // Using the same remote server
  port: parseInt(process.env.VITE_POSTGRES_PORT || '5432'),
  database: process.env.VITE_POSTGRES_DB || 'equiptrak',
  ssl: false
});

async function fixEngineerField() {
  const client = await pool.connect();
  try {
    console.log('Connected to database');
    
    // Check current schema
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'service_records'
      ORDER BY ordinal_position;
    `);
    
    console.log('Current service_records columns:');
    columns.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type}`);
    });
    
    // First make sure engineer_name exists
    console.log('\nAdding engineer_name column if it doesn\'t exist...');
    await client.query(`ALTER TABLE service_records ADD COLUMN IF NOT EXISTS engineer_name TEXT;`);
    
    // Check if engineer_id exists
    const engineerIdResult = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'service_records' AND column_name = 'engineer_id';
    `);
    
    if (engineerIdResult.rows.length > 0) {
      console.log('engineer_id column exists, copying data to engineer_name...');
      
      // Copy data from engineer_id to engineer_name
      await client.query(`
        UPDATE service_records 
        SET engineer_name = CAST(engineer_id AS TEXT) 
        WHERE engineer_id IS NOT NULL AND (engineer_name IS NULL OR engineer_name = '');
      `);
      
      console.log('Dropping engineer_id column...');
      // Drop the engineer_id column
      await client.query(`ALTER TABLE service_records DROP COLUMN IF EXISTS engineer_id CASCADE;`);
      
      console.log('Successfully fixed the engineer field!');
    } else {
      console.log('engineer_id column doesn\'t exist, no migration needed.');
    }
    
    // Check result
    const afterColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'service_records' AND column_name LIKE 'engineer%'
    `);
    
    console.log('\nEngineer columns after fix:');
    afterColumns.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type}`);
    });
    
    console.log('\nDone!');
  } catch (err) {
    console.error('Error fixing engineer field:', err);
  } finally {
    client.release();
    pool.end();
  }
}

fixEngineerField(); 