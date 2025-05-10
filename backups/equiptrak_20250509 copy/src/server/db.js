const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const pool = new Pool({
  user: process.env.VITE_POSTGRES_USER,
  host: process.env.VITE_POSTGRES_HOST,
  database: process.env.VITE_POSTGRES_DB,
  password: process.env.VITE_POSTGRES_PASSWORD,
  port: process.env.VITE_POSTGRES_PORT,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
    console.error('Connection details:', {
      host: process.env.VITE_POSTGRES_HOST,
      database: process.env.VITE_POSTGRES_DB,
      user: process.env.VITE_POSTGRES_USER,
      port: process.env.VITE_POSTGRES_PORT
    });
  } else {
    console.log('Database connected successfully');
  }
});

module.exports = { pool }; 