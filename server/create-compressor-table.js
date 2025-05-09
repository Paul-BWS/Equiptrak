/**
 * Run this script to create the compressors_records table
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createCompressorsTable() {
  const client = await pool.connect();
  
  try {
    console.log('Creating compressors_records table...');
    
    // First, create the uuid-ossp extension if it doesn't exist
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
    
    // Create the table with consistent naming (compressors_records)
    await client.query(`
      CREATE TABLE IF NOT EXISTS compressors_records (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id UUID NOT NULL,
        engineer_name VARCHAR(255),
        service_date DATE NOT NULL,
        retest_date DATE NOT NULL,
        status VARCHAR(50) NOT NULL,
        certificate_number VARCHAR(50),
        notes TEXT,
        equipment_name VARCHAR(255),
        equipment_serial VARCHAR(100),
        manufacturer VARCHAR(255),
        model VARCHAR(255),
        location VARCHAR(255),
        pressure_test_result VARCHAR(50),
        safety_valve_test VARCHAR(50),
        oil_level VARCHAR(50),
        belt_condition VARCHAR(50),
        filter_check_result VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Successfully created compressors_records table');
    
  } catch (error) {
    console.error('Error creating compressors_records table:', error);
  } finally {
    client.release();
    // Close the pool
    await pool.end();
  }
}

// Run the migration
createCompressorsTable(); 