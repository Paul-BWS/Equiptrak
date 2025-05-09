// Script to create service certificate sequence if it doesn't exist
require('dotenv').config();
const { Pool } = require('pg');

// Configure PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createCertificateSequence() {
  const client = await pool.connect();
  
  try {
    console.log('Checking for existing certificate sequence...');
    
    // Check if sequence exists
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'service_certificate_seq'
      );
    `);
    
    const sequenceExists = checkResult.rows[0].exists;
    
    if (sequenceExists) {
      console.log('Certificate sequence already exists');
    } else {
      console.log('Creating certificate sequence...');
      
      // Create sequence starting at 24570
      await client.query(`
        CREATE SEQUENCE service_certificate_seq START 24570;
        GRANT USAGE ON SEQUENCE service_certificate_seq TO PUBLIC;
      `);
      
      console.log('Certificate sequence created successfully');
    }
    
    // Test sequence by getting next value
    const testResult = await client.query(`
      SELECT nextval('service_certificate_seq')::TEXT AS next_number;
    `);
    
    console.log(`Next certificate number will be: BWS-${testResult.rows[0].next_number}`);
    
    console.log('Sequence setup complete!');
  } catch (error) {
    console.error('Error setting up certificate sequence:', error);
  } finally {
    client.release();
    pool.end();
  }
}

createCertificateSequence(); 