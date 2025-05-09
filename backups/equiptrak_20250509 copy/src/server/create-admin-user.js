const { Pool } = require('pg');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

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

async function createAdminUser() {
  try {
    console.log('Connecting to PostgreSQL database...');
    await pool.connect();
    console.log('Connected to PostgreSQL database successfully');

    // Check if contacts table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contacts'
      );
    `);
    
    const contactsTableExists = tableCheck.rows[0].exists;
    console.log(`Contacts table exists: ${contactsTableExists}`);

    if (!contactsTableExists) {
      console.log('Creating contacts table...');
      await pool.query(`
        CREATE TABLE contacts (
          id UUID PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'user',
          company_id UUID,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          job_title VARCHAR(100),
          phone VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_login TIMESTAMP WITH TIME ZONE
        );
      `);
      console.log('Contacts table created successfully');
    }

    // Check if the admin user already exists
    const userCheck = await pool.query(`
      SELECT * FROM contacts WHERE email = $1
    `, ['paul@basicwelding.co.uk']);

    if (userCheck.rows.length > 0) {
      console.log('Admin user already exists. Updating password...');
      
      // Hash the password
      const saltRounds = 10;
      const password = 'admin123'; // Default password
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Update the user
      await pool.query(`
        UPDATE contacts 
        SET password_hash = $1, role = 'admin', updated_at = NOW()
        WHERE email = $2
      `, [passwordHash, 'paul@basicwelding.co.uk']);
      
      console.log('Admin user password updated successfully');
    } else {
      console.log('Creating admin user...');
      
      // Hash the password
      const saltRounds = 10;
      const password = 'admin123'; // Default password
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Generate a UUID for the user
      const userId = uuidv4();
      
      // Insert the admin user
      await pool.query(`
        INSERT INTO contacts (
          id, email, password_hash, role, first_name, last_name, job_title, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
        )
      `, [
        userId,
        'paul@basicwelding.co.uk',
        passwordHash,
        'admin',
        'Paul',
        'Jones',
        'Administrator',
      ]);
      
      console.log('Admin user created successfully');
      console.log('Email: paul@basicwelding.co.uk');
      console.log('Password: admin123');
      console.log('Role: admin');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed');
  }
}

createAdminUser(); 