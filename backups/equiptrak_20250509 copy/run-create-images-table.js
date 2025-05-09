const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create database connection using the same config as the main app
const pool = new Pool({
  user: process.env.VITE_POSTGRES_USER || 'testuser',
  password: process.env.VITE_POSTGRES_PASSWORD || 'testpass',
  host: process.env.VITE_POSTGRES_HOST || '185.25.144.64',
  port: parseInt(process.env.VITE_POSTGRES_PORT || '5432'),
  database: process.env.VITE_POSTGRES_DB || 'equiptrak',
  ssl: false
});

async function createImagesTable() {
  try {
    console.log('Connecting to database...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'createImagesTable.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Executing SQL to create images table...');
    const result = await pool.query(sql);
    
    console.log('SQL executed successfully');
    
    // Check if images table exists
    const imagesCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'images'
      );
    `);
    
    if (imagesCheck.rows[0].exists) {
      console.log('Images table exists in the database ✅');
    } else {
      console.error('Failed to create images table ❌');
    }
    
    // Check if logo_url column exists in companies table
    const logoUrlCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'logo_url'
      ) as exists;
    `);
    
    if (logoUrlCheck.rows[0].exists) {
      console.log('logo_url column exists in companies table ✅');
    } else {
      console.error('Failed to add logo_url column to companies table ❌');
    }
    
  } catch (error) {
    console.error('Error creating images table:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the function
createImagesTable().then(() => {
  console.log('Script completed');
}).catch(err => {
  console.error('Script error:', err);
}); 