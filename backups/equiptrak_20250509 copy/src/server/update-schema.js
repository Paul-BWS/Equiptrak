const { Pool } = require('pg');
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

async function updateSchema() {
  const client = await pool.connect();
  
  try {
    console.log('Starting schema update...');
    
    // Start a transaction
    await client.query('BEGIN');
    
    // Add missing columns to companies table
    console.log('Adding missing columns to companies table...');
    
    // Check if city column exists
    const cityExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies'
        AND column_name = 'city'
      )
    `);
    
    if (!cityExists.rows[0].exists) {
      console.log('Adding city column...');
      await client.query('ALTER TABLE companies ADD COLUMN city TEXT');
    }
    
    // Check if county column exists
    const countyExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies'
        AND column_name = 'county'
      )
    `);
    
    if (!countyExists.rows[0].exists) {
      console.log('Adding county column...');
      await client.query('ALTER TABLE companies ADD COLUMN county TEXT');
    }
    
    // Check if postcode column exists
    const postcodeExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies'
        AND column_name = 'postcode'
      )
    `);
    
    if (!postcodeExists.rows[0].exists) {
      console.log('Adding postcode column...');
      await client.query('ALTER TABLE companies ADD COLUMN postcode TEXT');
    }
    
    // Check if country column exists
    const countryExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies'
        AND column_name = 'country'
      )
    `);
    
    if (!countryExists.rows[0].exists) {
      console.log('Adding country column...');
      await client.query('ALTER TABLE companies ADD COLUMN country TEXT');
    }
    
    // Check if telephone column exists
    const telephoneExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies'
        AND column_name = 'telephone'
      )
    `);
    
    if (!telephoneExists.rows[0].exists) {
      console.log('Adding telephone column...');
      await client.query('ALTER TABLE companies ADD COLUMN telephone TEXT');
    }
    
    // Check if industry column exists
    const industryExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies'
        AND column_name = 'industry'
      )
    `);
    
    if (!industryExists.rows[0].exists) {
      console.log('Adding industry column...');
      await client.query('ALTER TABLE companies ADD COLUMN industry TEXT');
    }
    
    // Check if website column exists
    const websiteExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies'
        AND column_name = 'website'
      )
    `);
    
    if (!websiteExists.rows[0].exists) {
      console.log('Adding website column...');
      await client.query('ALTER TABLE companies ADD COLUMN website TEXT');
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log('Schema update completed successfully!');
    
    // Verify the updated schema
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'companies'
      ORDER BY ordinal_position
    `);
    console.log('Updated companies table structure:');
    console.table(tableInfo.rows);
    
  } catch (error) {
    // Rollback the transaction in case of error
    await client.query('ROLLBACK');
    console.error('Error updating schema:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateSchema(); 