// Simple script to view PostgreSQL data
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

async function viewData() {
  try {
    console.log('Connecting to PostgreSQL database...');
    
    // Check connection
    const connectionResult = await pool.query('SELECT NOW()');
    console.log(`Connected to PostgreSQL at: ${connectionResult.rows[0].now}\n`);
    
    // Get companies
    console.log('COMPANIES TABLE:');
    console.log('================');
    const companiesResult = await pool.query(`
      SELECT id, name, address, contact_name, contact_email, contact_phone, created_at, updated_at 
      FROM companies 
      ORDER BY created_at DESC
    `);
    
    if (companiesResult.rows.length === 0) {
      console.log('No companies found in the database.\n');
    } else {
      console.log(`Found ${companiesResult.rows.length} companies:`);
      companiesResult.rows.forEach((company, index) => {
        console.log(`\n[Company ${index + 1}]`);
        console.log(`ID: ${company.id}`);
        console.log(`Name: ${company.name}`);
        console.log(`Address: ${company.address}`);
        console.log(`Contact: ${company.contact_name}`);
        console.log(`Email: ${company.contact_email}`);
        console.log(`Phone: ${company.contact_phone}`);
        console.log(`Created: ${new Date(company.created_at).toLocaleString()}`);
      });
      console.log('\n');
    }
    
    // Check if contacts table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'contacts'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      // Get contacts
      console.log('CONTACTS TABLE:');
      console.log('===============');
      const contactsResult = await pool.query(`
        SELECT * FROM contacts
        ORDER BY created_at DESC
      `);
      
      if (contactsResult.rows.length === 0) {
        console.log('No contacts found in the database.\n');
      } else {
        console.log(`Found ${contactsResult.rows.length} contacts:`);
        contactsResult.rows.forEach((contact, index) => {
          console.log(`\n[Contact ${index + 1}]`);
          console.log(`ID: ${contact.id}`);
          console.log(`Company ID: ${contact.company_id}`);
          console.log(`Name: ${contact.first_name} ${contact.last_name}`);
          console.log(`Email: ${contact.email || 'N/A'}`);
          console.log(`Phone: ${contact.telephone || 'N/A'}`);
          console.log(`Mobile: ${contact.mobile || 'N/A'}`);
          console.log(`Job Title: ${contact.job_title || 'N/A'}`);
          console.log(`Primary Contact: ${contact.is_primary ? 'Yes' : 'No'}`);
          console.log(`Created: ${new Date(contact.created_at).toLocaleString()}`);
        });
      }
    } else {
      console.log('Contacts table does not exist in the database.');
    }
    
  } catch (error) {
    console.error('Error viewing PostgreSQL data:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
viewData(); 