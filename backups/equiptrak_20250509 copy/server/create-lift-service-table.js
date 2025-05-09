// Script to create lift_service_records table
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

async function createLiftServiceTable() {
  const client = await pool.connect();
  
  try {
    console.log('Checking if lift_service_records table exists...');
    
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'lift_service_records'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('lift_service_records table already exists. Skipping creation.');
      return;
    }
    
    console.log('Creating lift_service_records table...');
    
    // Create the table
    await client.query(`
      CREATE TABLE lift_service_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        product_category TEXT,
        model TEXT,
        serial_number TEXT,
        certificate_number TEXT,
        service_date TIMESTAMP NOT NULL,
        retest_date TIMESTAMP,
        engineer_name TEXT NOT NULL,
        signature_image TEXT,
        swl TEXT,
        notes TEXT,
        safe_working_test BOOLEAN,
        emergency_stops_test BOOLEAN,
        limit_switches_test BOOLEAN,
        safety_devices_test BOOLEAN,
        hydraulic_system_test BOOLEAN,
        pressure_relief_test BOOLEAN,
        electrical_system_test BOOLEAN,
        platform_operation_test BOOLEAN,
        fail_safe_devices_test BOOLEAN,
        lifting_structure_test BOOLEAN,
        status TEXT DEFAULT 'pending',
        public_access_token TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('lift_service_records table created successfully!');
    
    // Create index on company_id for faster lookups
    console.log('Creating index on company_id...');
    await client.query(`
      CREATE INDEX lift_service_records_company_id_idx ON lift_service_records(company_id);
    `);
    
    // Create index on certificate_number for faster lookups
    console.log('Creating index on certificate_number...');
    await client.query(`
      CREATE INDEX lift_service_records_certificate_number_idx ON lift_service_records(certificate_number);
    `);
    
    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up lift_service_records table:', error);
  } finally {
    client.release();
    pool.end();
  }
}

createLiftServiceTable(); 