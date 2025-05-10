const { Pool } = require('pg');
require('dotenv').config();

async function checkCompany() {
  console.log('Checking for company in database...');
  
  const pool = new Pool({
    user: 'equiptrak',
    password: 'equiptrak',
    host: '185.25.144.64',
    port: 5432,
    database: 'equiptrak',
    ssl: false
  });

  try {
    const client = await pool.connect();
    console.log('Connected to database');
    
    // Check if companies table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'companies'
      );
    `);
    
    console.log('Companies table exists:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      // Get all companies
      const result = await client.query('SELECT * FROM companies ORDER BY name');
      console.log('Number of companies found:', result.rows.length);
      
      // Display all companies
      console.log('\nCompanies in database:');
      result.rows.forEach((company, index) => {
        console.log(`${index + 1}. ${company.name || 'No name'} (ID: ${company.id})`);
        console.log('   Details:', JSON.stringify(company, null, 2));
      });
      
      // Check specifically for Acme Co
      const acmeCheck = await client.query("SELECT * FROM companies WHERE name LIKE '%Acme%'");
      console.log('\nCompanies with "Acme" in the name:', acmeCheck.rows.length);
      if (acmeCheck.rows.length > 0) {
        console.log('Found Acme company:', acmeCheck.rows[0]);
      } else {
        console.log('No company with "Acme" in the name found');
      }
    }
    
    client.release();
  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await pool.end();
  }
}

checkCompany().catch(err => console.error('Error in main function:', err)); 