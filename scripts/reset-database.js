const { Pool } = require('pg');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

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

async function resetDatabase() {
  try {
    // Drop existing tables in the correct order
    await pool.query(`
      DROP TABLE IF EXISTS service_records CASCADE;
      DROP TABLE IF EXISTS equipment CASCADE;
      DROP TABLE IF EXISTS contacts CASCADE;
      DROP TABLE IF EXISTS companies CASCADE;
      DROP TABLE IF EXISTS notes CASCADE;
    `);
    console.log('Existing tables dropped');

    // Create companies table
    await pool.query(`
      CREATE TABLE companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        address TEXT,
        city TEXT,
        postcode TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX idx_companies_name ON companies(name);
    `);
    console.log('Companies table created');

    // Create contacts table
    await pool.query(`
      CREATE TABLE contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE,
        password_hash TEXT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        telephone TEXT,
        mobile TEXT,
        job_title TEXT,
        is_primary BOOLEAN DEFAULT false,
        has_system_access BOOLEAN DEFAULT false,
        role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE
      );
      CREATE INDEX idx_contacts_company_id ON contacts(company_id);
      CREATE INDEX idx_contacts_email ON contacts(email) WHERE email IS NOT NULL;
    `);
    console.log('Contacts table created');

    // Create equipment table
    await pool.query(`
      CREATE TABLE equipment (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        serial_number TEXT NOT NULL,
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'active',
        type TEXT,
        next_test_date TIMESTAMP WITH TIME ZONE,
        last_test_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX idx_equipment_company_id ON equipment(company_id);
      CREATE INDEX idx_equipment_type ON equipment(type);
      CREATE UNIQUE INDEX idx_equipment_serial_company ON equipment(company_id, serial_number);
    `);
    console.log('Equipment table created');

    // Create service records table
    await pool.query(`
      CREATE TABLE service_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        service_date TIMESTAMP WITH TIME ZONE NOT NULL,
        retest_date TIMESTAMP WITH TIME ZONE,
        notes TEXT,
        status TEXT DEFAULT 'valid',
        certificate_number TEXT UNIQUE,
        certificate_url TEXT,
        engineer_name TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX idx_service_records_company_id ON service_records(company_id);
      CREATE INDEX idx_service_records_equipment_id ON service_records(equipment_id);
    `);
    console.log('Service records table created');

    // Create notes table
    await pool.query(`
      CREATE TABLE notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        created_by UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX idx_notes_company_id ON notes(company_id);
    `);
    console.log('Notes table created');

    // Create default admin user
    const adminCompanyResult = await pool.query(`
      INSERT INTO companies (name, address, city, postcode)
      VALUES ('EquipTrak Admin', '123 Admin Street', 'London', 'SW1A 1AA')
      RETURNING id;
    `);
    const adminCompanyId = adminCompanyResult.rows[0].id;

    const adminPasswordHash = await bcrypt.hash('admin@2024', 10);
    await pool.query(`
      INSERT INTO contacts (
        email,
        password_hash,
        first_name,
        last_name,
        company_id,
        role,
        has_system_access,
        is_primary
      ) VALUES (
        'admin@equiptrak.com',
        $1,
        'Admin',
        'User',
        $2,
        'admin',
        true,
        true
      )
    `, [adminPasswordHash, adminCompanyId]);
    console.log('Default admin user created');

    console.log('Database reset and recreated successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

resetDatabase(); 