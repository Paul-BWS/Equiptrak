const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.VITE_POSTGRES_USER || 'testuser',
  password: process.env.VITE_POSTGRES_PASSWORD || 'testpass',
  host: process.env.VITE_POSTGRES_HOST || '185.25.144.64',
  port: parseInt(process.env.VITE_POSTGRES_PORT || '5432'),
  database: process.env.VITE_POSTGRES_DB || 'equiptrak',
  ssl: false
});

async function checkUsers() {
  try {
    const result = await pool.query('SELECT * FROM users');
    console.log(`Found ${result.rows.length} users:`);
    console.table(result.rows);
  } catch (err) {
    console.error('Error checking users table:', err);
  } finally {
    pool.end();
  }
}

checkUsers();
