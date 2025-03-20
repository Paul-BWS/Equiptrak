const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.VITE_POSTGRES_USER || 'testuser',
  password: process.env.VITE_POSTGRES_PASSWORD || 'testpass',
  host: process.env.VITE_POSTGRES_HOST || '185.25.144.64',
  port: parseInt(process.env.VITE_POSTGRES_PORT || '5432'),
  database: process.env.VITE_POSTGRES_DB || 'equiptrak',
  ssl: false
});

async function resetTables() {
  try {
    // Drop existing tables
    await pool.query(`
      DROP TABLE IF EXISTS equipment CASCADE;
      DROP TABLE IF EXISTS contacts CASCADE;
      DROP TABLE IF EXISTS companies CASCADE;
    `);
    console.log('Existing tables dropped');

    // Create companies table
    await pool.query(`
      CREATE TABLE companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        address TEXT,
        contact_name VARCHAR(255),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('Companies table created');

    // Create contacts table
    await pool.query(`
      CREATE TABLE contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        company_id UUID REFERENCES companies(id),
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        job_title VARCHAR(255),
        telephone VARCHAR(50),
        mobile VARCHAR(50),
        is_primary BOOLEAN DEFAULT false,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('Contacts table created');

    // Create equipment table
    await pool.query(`
      CREATE TABLE equipment (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        serial_number VARCHAR(255),
        company_id UUID REFERENCES companies(id),
        status VARCHAR(50) DEFAULT 'active',
        last_service_date TIMESTAMP WITH TIME ZONE,
        next_service_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('Equipment table created');

  } catch (error) {
    console.error('Error resetting tables:', error);
  } finally {
    await pool.end();
  }
}

resetTables(); 