// Script to add user authentication fields to the contacts table
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

async function addUserFields() {
  try {
    console.log('Adding user authentication fields to contacts table...');
    
    // Add the new columns
    await pool.query(`
      ALTER TABLE contacts
      ADD COLUMN IF NOT EXISTS password_hash TEXT,
      ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
      ADD COLUMN IF NOT EXISTS has_system_access BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
      
      -- Add a unique constraint on email for users with system access
      CREATE UNIQUE INDEX IF NOT EXISTS contacts_email_system_access_idx 
      ON contacts (email) 
      WHERE has_system_access = true;
    `);
    
    console.log('User authentication fields added successfully!');
  } catch (error) {
    console.error('Error adding user fields:', error);
  } finally {
    await pool.end();
  }
}

// Run the function
addUserFields(); 