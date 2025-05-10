// Script to verify database changes
require('dotenv-safe').config({
  allowEmptyValues: true,
  path: require('path').resolve(__dirname, '.env'),
  example: require('path').resolve(__dirname, '.env.example')
});

const { Pool } = require('pg');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB
});

async function verifyChanges() {
  const client = await pool.connect();
  
  try {
    // Check for any remaining duplicates
    const duplicateCheck = await client.query(`
      SELECT serial_number, COUNT(*) 
      FROM lift_service_records 
      WHERE serial_number IS NOT NULL
      GROUP BY serial_number 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateCheck.rows.length > 0) {
      console.error('❌ Duplicate serial numbers still exist:');
      duplicateCheck.rows.forEach(row => {
        console.error(`  Serial number: ${row.serial_number}, Count: ${row.count}`);
      });
    } else {
      console.log('✅ No duplicate serial numbers found!');
    }
    
    // Check if constraint exists
    const constraintCheck = await client.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'lift_service_records'
      AND constraint_name = 'unique_serial_number'
    `);
    
    if (constraintCheck.rows.length > 0) {
      console.log('✅ Unique constraint exists on serial_number column!');
    } else {
      console.error('❌ Unique constraint does not exist!');
    }
    
    // Show updated records
    const records = await client.query(`
      SELECT id, product_category, model, serial_number, certificate_number
      FROM lift_service_records
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log('\nLatest 10 lift service records:');
    console.log('-------------------------------');
    records.rows.forEach(row => {
      console.log(`ID: ${row.id.substring(0, 8)}...`);
      console.log(`Type: ${row.product_category || 'N/A'}`);
      console.log(`Model: ${row.model || 'N/A'}`);
      console.log(`Serial Number: ${row.serial_number || 'N/A'}`);
      console.log(`Certificate: ${row.certificate_number || 'N/A'}`);
      console.log('-------------------------------');
    });
    
  } catch (error) {
    console.error('Error verifying changes:', error);
  } finally {
    client.release();
    pool.end();
  }
}

// Execute verification
verifyChanges().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
}); 