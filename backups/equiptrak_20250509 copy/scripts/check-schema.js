// Script to check the schema of the companies table
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

async function checkSchema() {
  try {
    console.log('Connecting to PostgreSQL database...');
    
    // Query to get column information for the companies table
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'companies'
    `);
    
    console.log(`Found ${result.rows.length} columns in the companies table:`);
    console.table(result.rows);
    
    // Also check if the table has any data
    const countResult = await pool.query('SELECT COUNT(*) FROM companies');
    console.log(`Total companies in the database: ${countResult.rows[0].count}`);
    
    // Get a sample row if any exists
    if (parseInt(countResult.rows[0].count) > 0) {
      const sampleResult = await pool.query('SELECT * FROM companies LIMIT 1');
      console.log('Sample company record:');
      console.log(sampleResult.rows[0]);
    }
    
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
checkSchema(); 