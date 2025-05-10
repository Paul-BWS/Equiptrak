require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB
});

async function checkDatabase() {
  try {
    console.log('Testing database connection...');
    console.log('Connection details:', {
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER
    });

    // Test basic connection
    const connectionTest = await pool.query('SELECT NOW()');
    console.log('Database connection successful:', connectionTest.rows[0]);

    // Check products table
    const productsResult = await pool.query('SELECT COUNT(*) FROM products');
    console.log('Number of products:', productsResult.rows[0].count);

    // Get a sample of products
    const sampleProducts = await pool.query('SELECT * FROM products LIMIT 3');
    console.log('Sample products:', sampleProducts.rows);

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await pool.end();
  }
}

checkDatabase(); 