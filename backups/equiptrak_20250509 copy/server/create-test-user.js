const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB
});

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin@2024', 10);
    await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET password = $2',
      ['admin@equiptrak.com', hashedPassword, 'admin']
    );
    console.log('Test user created/updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser(); 