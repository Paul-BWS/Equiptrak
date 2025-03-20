// Script to check companies table with UI column names
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
    
    // Check connection
    const connectionResult = await pool.query('SELECT NOW()');
    console.log(`Connected to PostgreSQL at: ${connectionResult.rows[0].now}\n`);
    
    // First, check table structure
    console.log('CHECKING TABLE STRUCTURE:');
    console.log('========================');
    const tableStructure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'companies'
      ORDER BY ordinal_position
    `);
    
    console.log('Companies table columns:');
    tableStructure.rows.forEach(column => {
      console.log(`- ${column.column_name} (${column.data_type})`);
    });
    console.log('\n');
    
    // Try querying with company_name column
    console.log('TRYING WITH company_name COLUMN:');
    console.log('==============================');
    try {
      const companiesResult = await pool.query(`
        SELECT id, company_name, address, city, county, postcode, country, telephone, website, industry, created_at, updated_at 
        FROM companies 
        ORDER BY created_at DESC
      `);
      
      if (companiesResult.rows.length === 0) {
        console.log('No companies found with company_name column.\n');
      } else {
        console.log(`Found ${companiesResult.rows.length} companies with company_name column:`);
        companiesResult.rows.forEach((company, index) => {
          console.log(`\n[Company ${index + 1}]`);
          console.log(`ID: ${company.id}`);
          console.log(`Name: ${company.company_name}`);
          console.log(`Address: ${company.address || 'N/A'}`);
          console.log(`City: ${company.city || 'N/A'}`);
          console.log(`County: ${company.county || 'N/A'}`);
          console.log(`Postcode: ${company.postcode || 'N/A'}`);
          console.log(`Country: ${company.country || 'N/A'}`);
          console.log(`Telephone: ${company.telephone || 'N/A'}`);
          console.log(`Website: ${company.website || 'N/A'}`);
          console.log(`Industry: ${company.industry || 'N/A'}`);
          console.log(`Created: ${new Date(company.created_at).toLocaleString()}`);
        });
      }
    } catch (error) {
      console.error('Error querying with company_name:', error.message);
    }
    
    // Try querying with name column
    console.log('\nTRYING WITH name COLUMN:');
    console.log('======================');
    try {
      const companiesResult = await pool.query(`
        SELECT id, name, address, contact_name, contact_email, contact_phone, created_at, updated_at 
        FROM companies 
        ORDER BY created_at DESC
      `);
      
      if (companiesResult.rows.length === 0) {
        console.log('No companies found with name column.\n');
      } else {
        console.log(`Found ${companiesResult.rows.length} companies with name column:`);
        companiesResult.rows.forEach((company, index) => {
          console.log(`\n[Company ${index + 1}]`);
          console.log(`ID: ${company.id}`);
          console.log(`Name: ${company.name}`);
          console.log(`Address: ${company.address || 'N/A'}`);
          console.log(`Contact: ${company.contact_name || 'N/A'}`);
          console.log(`Email: ${company.contact_email || 'N/A'}`);
          console.log(`Phone: ${company.contact_phone || 'N/A'}`);
          console.log(`Created: ${new Date(company.created_at).toLocaleString()}`);
        });
      }
    } catch (error) {
      console.error('Error querying with name:', error.message);
    }
    
  } catch (error) {
    console.error('Error checking companies:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
checkCompanies(); 