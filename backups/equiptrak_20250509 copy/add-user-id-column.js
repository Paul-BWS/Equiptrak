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

async function addUserIdColumn() {
  try {
    console.log('Connecting to PostgreSQL database...');
    
    // Check if the user_id column already exists
    const columnCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'contacts' AND column_name = 'user_id'
      );
    `);
    
    if (columnCheck.rows[0].exists) {
      console.log('The user_id column already exists in the contacts table.');
      return;
    }
    
    // Add the user_id column to the contacts table
    await pool.query(`
      ALTER TABLE contacts
      ADD COLUMN user_id UUID,
      ADD CONSTRAINT fk_user 
      FOREIGN KEY (user_id) 
      REFERENCES users(id)
    `);
    
    console.log('Successfully added user_id column to contacts table!');
    
  } catch (error) {
    console.error('Error adding user_id column:', error);
  } finally {
    // Close the pool
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the function
addUserIdColumn(); 