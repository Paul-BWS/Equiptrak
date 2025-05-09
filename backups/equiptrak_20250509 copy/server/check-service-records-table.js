require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');

console.log('Checking for service_records table in database');
console.log('Using database settings:');
console.log('Host:', process.env.POSTGRES_HOST);
console.log('Database:', process.env.POSTGRES_DB);

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB
});

async function checkAndCreateTable() {
  try {
    // Check if service_records table exists
    console.log('Checking if service_records table exists...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'service_records'
      )
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    console.log('Service records table exists:', tableExists);
    
    if (!tableExists) {
      console.log('Creating service_records table...');
      
      // Create the service_records table
      await pool.query(`
        CREATE TABLE service_records (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          service_date DATE NOT NULL,
          retest_date DATE,
          engineer_name TEXT NOT NULL,
          certificate_number TEXT NOT NULL,
          notes TEXT,
          status TEXT DEFAULT 'valid',
          equipment1_name TEXT,
          equipment1_serial TEXT,
          equipment2_name TEXT,
          equipment2_serial TEXT,
          equipment3_name TEXT,
          equipment3_serial TEXT,
          equipment4_name TEXT,
          equipment4_serial TEXT,
          equipment5_name TEXT,
          equipment5_serial TEXT,
          equipment6_name TEXT,
          equipment6_serial TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
      
      console.log('Service records table created successfully!');
    } else {
      // Verify table structure
      console.log('Checking service_records table columns...');
      const columnsCheck = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'service_records'
      `);
      
      console.log('Service_records table columns:');
      columnsCheck.rows.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`);
      });
    }
    
    console.log('Database check complete');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed');
  }
}

checkAndCreateTable(); 