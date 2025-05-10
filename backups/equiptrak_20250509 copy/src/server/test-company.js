require('dotenv').config();
const { Pool } = require('pg');

// Create a new database pool using the DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

// Function to test adding a company
async function testAddCompany() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database, inserting test company...');
    
    // Sample company data
    const company = {
      company_name: 'Direct DB Test Company',
      address: '123 Direct St',
      city: 'Directville',
      county: 'Directshire',
      postcode: 'DB1 1DB',
      country: 'United Kingdom',
      telephone: '07123456789',
      email: 'direct@test.com',
      website: 'www.directtest.com',
      status: 'Active',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Insert the company
    const result = await client.query(`
      INSERT INTO companies (
        company_name, address, city, county, postcode, country, 
        telephone, email, website, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING *
    `, [
      company.company_name,
      company.address,
      company.city,
      company.county,
      company.postcode,
      company.country,
      company.telephone,
      company.email,
      company.website,
      company.status,
      company.created_at,
      company.updated_at
    ]);
    
    console.log('Company inserted successfully:');
    console.log(JSON.stringify(result.rows[0], null, 2));
    
    // Show all companies
    const companies = await client.query('SELECT * FROM companies');
    console.log(`\nAll companies (${companies.rows.length}):`);
    companies.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.company_name} (${row.id})`);
    });
    
  } catch (error) {
    console.error('Error inserting company:', error);
  } finally {
    client.release();
    // Close the pool
    pool.end();
  }
}

// Run the function
testAddCompany().catch(err => {
  console.error('Failed to run test:', err);
  process.exit(1);
});
 