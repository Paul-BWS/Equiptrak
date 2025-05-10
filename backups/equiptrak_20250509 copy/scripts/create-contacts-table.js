// Script to create the contacts table in the PostgreSQL database
const { Pool } = require('pg');

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.VITE_POSTGRES_USER || 'testuser',
  password: process.env.VITE_POSTGRES_PASSWORD || 'testpass',
  host: process.env.VITE_POSTGRES_HOST || '185.25.144.64',
  port: parseInt(process.env.VITE_POSTGRES_PORT || '5432'),
  database: process.env.VITE_POSTGRES_DB || 'equiptrak',
  ssl: false
});

async function createContactsTable() {
  try {
    console.log('Connecting to PostgreSQL database...');
    
    // Check if the contacts table already exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'contacts'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('The contacts table already exists in the database.');
      return;
    }
    
    // Create the contacts table
    await pool.query(`
      CREATE TABLE contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        telephone TEXT,
        mobile TEXT,
        job_title TEXT,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    console.log('Contacts table created successfully!');
    
    // Create an index on company_id for faster lookups
    await pool.query(`
      CREATE INDEX idx_contacts_company_id ON contacts(company_id);
    `);
    
    console.log('Index on company_id created successfully!');
    
  } catch (error) {
    console.error('Error creating contacts table:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
createContactsTable(); 