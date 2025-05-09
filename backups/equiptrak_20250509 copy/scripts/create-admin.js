const { Pool } = require('pg');
const bcrypt = require('bcrypt');
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

async function createAdminUser() {
  try {
    // First, ensure the companies table has Basic Welding
    const companyResult = await pool.query(`
      INSERT INTO companies (name, created_at, updated_at)
      VALUES ('Basic Welding Supplies Ltd', NOW(), NOW())
      ON CONFLICT (name) DO UPDATE 
      SET updated_at = NOW()
      RETURNING id;
    `);

    const companyId = companyResult.rows[0].id;

    // Hash the password
    const password = 'admin123'; // You should change this after first login
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const result = await pool.query(`
      INSERT INTO contacts (
        email,
        password_hash,
        role,
        company_id,
        created_at,
        updated_at
      )
      VALUES (
        'paul@basicwelding.co.uk',
        $1,
        'admin',
        $2,
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO UPDATE 
      SET 
        password_hash = $1,
        role = 'admin',
        company_id = $2,
        updated_at = NOW()
      RETURNING id, email, role;
    `, [passwordHash, companyId]);

    console.log('Admin user created/updated:', result.rows[0]);
    console.log('Password is:', password);
    console.log('Please change this password after first login');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdminUser(); 