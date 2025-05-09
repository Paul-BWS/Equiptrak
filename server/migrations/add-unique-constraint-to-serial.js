// Script to add unique constraint to serial_number in lift_service_records table
require('dotenv-safe').config({
  allowEmptyValues: true,
  path: require('path').resolve(__dirname, '../.env'),
  example: require('path').resolve(__dirname, '../.env.example')
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

async function addUniqueConstraint() {
  const client = await pool.connect();
  
  try {
    console.log('Adding unique constraint to serial_number in lift_service_records table...');
    
    // Start transaction
    await client.query('BEGIN');
    
    // First, check if there are any duplicate serial numbers that would violate the constraint
    const duplicateCheck = await client.query(`
      SELECT serial_number, COUNT(*) 
      FROM lift_service_records 
      WHERE serial_number IS NOT NULL
      GROUP BY serial_number 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateCheck.rows.length > 0) {
      console.error('Duplicate serial numbers found:');
      duplicateCheck.rows.forEach(row => {
        console.error(`  Serial number: ${row.serial_number}, Count: ${row.count}`);
      });
      
      console.log('Updating duplicate serial numbers to make them unique...');
      
      // For each duplicate serial number, update all but the first record
      for (const row of duplicateCheck.rows) {
        const serialNumber = row.serial_number;
        
        // Get all records with this serial number, ordered by creation date
        const records = await client.query(`
          SELECT id, created_at 
          FROM lift_service_records 
          WHERE serial_number = $1
          ORDER BY created_at ASC
        `, [serialNumber]);
        
        // Skip the first (oldest) record, update all others
        for (let i = 1; i < records.rows.length; i++) {
          const newSerialNumber = `${serialNumber}-DUPLICATE-${i}`;
          await client.query(`
            UPDATE lift_service_records 
            SET serial_number = $1 
            WHERE id = $2
          `, [newSerialNumber, records.rows[i].id]);
          
          console.log(`Updated record ${records.rows[i].id} serial number to ${newSerialNumber}`);
        }
      }
    } else {
      console.log('No duplicate serial numbers found, proceeding with constraint creation.');
    }
    
    // Add unique constraint
    await client.query(`
      ALTER TABLE lift_service_records 
      ADD CONSTRAINT unique_serial_number UNIQUE (serial_number)
    `);
    
    await client.query('COMMIT');
    console.log('Successfully added unique constraint to serial_number column!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding unique constraint:', error);
  } finally {
    client.release();
    pool.end();
  }
}

// Execute migration
addUniqueConstraint().catch(err => {
  console.error('Failed to add unique constraint:', err);
  process.exit(1);
}); 