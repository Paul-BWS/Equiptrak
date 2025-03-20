// Script to check contacts in the PostgreSQL database
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

async function checkContacts() {
  try {
    console.log('Connecting to PostgreSQL database...');
    
    // First, check if the contacts table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'contacts'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('The contacts table does not exist in the database.');
      return;
    }
    
    // Check the schema of the contacts table
    const schemaResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'contacts'
    `);
    
    console.log(`Found ${schemaResult.rows.length} columns in the contacts table:`);
    console.table(schemaResult.rows);
    
    // Query the contacts table
    const result = await pool.query(`
      SELECT * FROM contacts
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    console.log(`Found ${result.rows.length} contacts:`);
    if (result.rows.length > 0) {
      console.table(result.rows);
    } else {
      console.log('No contacts found in the database.');
    }
    
    // Check if any contacts are associated with companies
    if (result.rows.length > 0 && result.rows[0].company_id) {
      console.log('\nChecking company associations for contacts:');
      
      const companyContacts = await pool.query(`
        SELECT c.id, c.name, COUNT(ct.id) as contact_count
        FROM companies c
        LEFT JOIN contacts ct ON c.id = ct.company_id
        GROUP BY c.id, c.name
        ORDER BY contact_count DESC
      `);
      
      console.log('Companies and their contact counts:');
      console.table(companyContacts.rows);
    }
    
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
checkContacts(); 