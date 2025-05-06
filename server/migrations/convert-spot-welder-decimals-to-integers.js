/**
 * Migration script to convert spot welder decimal columns to integers
 * This fixes the issue with decimal points appearing in the UI
 */
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

async function migrateDecimalsToIntegers() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration: Converting decimal columns to integers in spot_welder_records table');
    
    // Begin a transaction
    await client.query('BEGIN');
    
    // First, convert the existing data by rounding all decimal values
    // This ensures no data loss when changing column types
    console.log('Rounding existing decimal values...');
    await client.query(`
      UPDATE spot_welder_records
      SET 
        voltage_max = ROUND(voltage_max),
        voltage_min = ROUND(voltage_min),
        air_pressure = ROUND(air_pressure),
        tip_pressure = ROUND(tip_pressure),
        length = ROUND(length),
        diameter = ROUND(diameter)
    `);
    
    // Now alter the columns from DECIMAL to INTEGER
    console.log('Altering column types from DECIMAL to INTEGER...');
    
    const columnsToChange = [
      'voltage_max',
      'voltage_min',
      'air_pressure',
      'tip_pressure',
      'length',
      'diameter'
    ];
    
    for (const column of columnsToChange) {
      await client.query(`
        ALTER TABLE spot_welder_records
        ALTER COLUMN ${column} TYPE INTEGER USING (${column}::INTEGER)
      `);
      console.log(`Converted ${column} to INTEGER`);
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log('Migration completed successfully!');
    console.log('All decimal columns have been converted to integers.');
    
  } catch (error) {
    // If any error occurs, roll back the changes
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
migrateDecimalsToIntegers(); 