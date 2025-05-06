/**
 * Run this script to create the spot_welder_records table
 */
require('dotenv-safe').config({
  allowEmptyValues: true,
  path: require('path').resolve(__dirname, '.env'),
  example: require('path').resolve(__dirname, '.env.example')
});

const { Pool } = require('pg');

// Initialize PostgreSQL connection pool with the same config as the main server
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB
});

async function createSpotWelderTable() {
  const client = await pool.connect();
  
  try {
    console.log('Creating spot_welder_records table...');
    console.log('Database connection:', process.env.POSTGRES_HOST);
    
    // First, create the uuid-ossp extension if it doesn't exist
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
    
    // Create the table with field names matching the UI form
    await client.query(`
      CREATE TABLE IF NOT EXISTS spot_welder_records (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id UUID NOT NULL,
        certificate_number VARCHAR(50),
        service_date DATE NOT NULL,
        retest_date DATE NOT NULL,
        status VARCHAR(50) NOT NULL,
        model VARCHAR(255),
        serial_number VARCHAR(100),
        engineer_name VARCHAR(255),
        equipment_type VARCHAR(100),
        voltage_max DECIMAL(10,2),
        voltage_min DECIMAL(10,2),
        air_pressure DECIMAL(10,2),
        tip_pressure DECIMAL(10,2),
        length DECIMAL(10,2),
        diameter DECIMAL(10,2),
        machine1 VARCHAR(100),
        meter1 VARCHAR(100),
        machine_time1 VARCHAR(50),
        meter_time1 VARCHAR(50),
        machine2 VARCHAR(100),
        meter2 VARCHAR(100),
        machine_time2 VARCHAR(50),
        meter_time2 VARCHAR(50),
        machine3 VARCHAR(100),
        meter3 VARCHAR(100),
        machine_time3 VARCHAR(50),
        meter_time3 VARCHAR(50),
        machine4 VARCHAR(100),
        meter4 VARCHAR(100),
        machine_time4 VARCHAR(50),
        meter_time4 VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Successfully created spot_welder_records table');
    
  } catch (error) {
    console.error('Error creating spot_welder_records table:', error);
  } finally {
    client.release();
    // Close the pool
    await pool.end();
  }
}

// Run the migration
createSpotWelderTable(); 