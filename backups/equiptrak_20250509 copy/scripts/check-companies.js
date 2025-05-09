// Simple script to check companies in the PostgreSQL database
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

async function checkCompanies() {
  try {
    console.log('Connecting to PostgreSQL database...');
    
    // Query the companies table with correct column names
    const result = await pool.query(`
      SELECT id, name, address, contact_name, contact_email, contact_phone, created_at, updated_at 
      FROM companies 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    console.log(`Found ${result.rows.length} companies:`);
    console.table(result.rows);
    
    // Check if any new companies were added recently (in the last hour)
    const recentResult = await pool.query(`
      SELECT id, name, created_at 
      FROM companies 
      WHERE created_at > NOW() - INTERVAL '1 hour'
      ORDER BY created_at DESC
    `);
    
    if (recentResult.rows.length > 0) {
      console.log(`\nCompanies added in the last hour: ${recentResult.rows.length}`);
      console.table(recentResult.rows);
    } else {
      console.log('\nNo companies were added in the last hour.');
    }
    
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
checkCompanies(); 