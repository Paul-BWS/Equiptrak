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

async function checkContactsTable() {
  try {
    console.log('Connecting to PostgreSQL database...');
    await pool.connect();
    console.log('Connected to PostgreSQL database successfully');

    // Check if contacts table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contacts'
      );
    `);
    
    const contactsTableExists = tableCheck.rows[0].exists;
    console.log(`Contacts table exists: ${contactsTableExists}`);

    if (contactsTableExists) {
      // Get table structure
      const tableStructure = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'contacts'
        ORDER BY ordinal_position;
      `);
      
      console.log('Contacts table structure:');
      console.table(tableStructure.rows);

      // Check if there are any contacts in the table
      const contactCount = await pool.query('SELECT COUNT(*) FROM contacts');
      console.log(`Number of contacts in database: ${contactCount.rows[0].count}`);

      if (parseInt(contactCount.rows[0].count) > 0) {
        // Get a sample contact
        const sampleContact = await pool.query(`
          SELECT * FROM contacts LIMIT 1
        `);
        
        console.log('Sample contact data:');
        console.log(sampleContact.rows[0]);
      }

      // Check if the email and password_hash columns exist
      const authColumns = tableStructure.rows.filter(
        col => col.column_name === 'email' || col.column_name === 'password_hash'
      );
      
      if (authColumns.length === 2) {
        console.log('Authentication columns (email, password_hash) exist in the contacts table');
      } else {
        console.log('WARNING: Authentication columns are missing from the contacts table');
        console.log('Missing columns:', 
          ['email', 'password_hash'].filter(
            col => !authColumns.some(c => c.column_name === col)
          )
        );
      }
    } else {
      console.log('Contacts table does not exist. Authentication will not work.');
    }
  } catch (error) {
    console.error('Error checking contacts table:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed');
  }
}

checkContactsTable(); 