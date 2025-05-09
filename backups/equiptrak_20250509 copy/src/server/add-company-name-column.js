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

async function addCompanyNameColumn() {
  try {
    console.log('Checking if company_name column exists...');
    
    // Check if the column already exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'companies'
      AND column_name = 'company_name'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('company_name column already exists');
    } else {
      console.log('Adding company_name column to companies table...');
      
      // Add the company_name column
      await pool.query(`
        ALTER TABLE public.companies
        ADD COLUMN company_name TEXT
      `);
      
      console.log('company_name column added successfully');
      
      // Copy values from name to company_name
      console.log('Copying values from name to company_name...');
      await pool.query(`
        UPDATE public.companies
        SET company_name = name
        WHERE company_name IS NULL
      `);
      
      console.log('Values copied successfully');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the migration
addCompanyNameColumn(); 