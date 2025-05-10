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

async function fixDatabase() {
  try {
    console.log('Connecting to PostgreSQL database...');
    
    // Drop and recreate the companies table
    await pool.query(`
      DROP TABLE IF EXISTS companies CASCADE;
      
      CREATE TABLE companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        address TEXT,
        contact_name TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Add unique constraint on company name
      ALTER TABLE companies ADD CONSTRAINT unique_company_name UNIQUE (name);
      
      -- Insert test data
      INSERT INTO companies (name, address, contact_name, contact_email, contact_phone)
      VALUES (
        'BWS Company',
        '123 Test Street',
        'John Doe',
        'john@bwscompany.com',
        '555-1234'
      );
    `);
    
    console.log('Database structure fixed successfully');
    
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await pool.end();
  }
}

fixDatabase(); 