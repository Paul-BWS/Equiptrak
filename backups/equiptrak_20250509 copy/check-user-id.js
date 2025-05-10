const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.VITE_POSTGRES_USER || 'testuser',
  password: process.env.VITE_POSTGRES_PASSWORD || 'testpass',
  host: process.env.VITE_POSTGRES_HOST || '185.25.144.64',
  port: parseInt(process.env.VITE_POSTGRES_PORT || '5432'),
  database: process.env.VITE_POSTGRES_DB || 'equiptrak',
  ssl: false
});

async function checkUserIdColumn() {
  try {
    // Check if user_id column exists in contacts table
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'contacts' AND column_name = 'user_id'
      ) as exists
    `);
    
    const userIdExists = result.rows[0].exists;
    console.log('user_id column exists in contacts table:', userIdExists);
    
    if (!userIdExists) {
      console.log('Adding user_id column to contacts table...');
      await pool.query(`
        ALTER TABLE contacts 
        ADD COLUMN user_id UUID,
        ADD CONSTRAINT fk_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id)
      `);
      console.log('user_id column added successfully');
    }
  } catch (error) {
    console.error('Error checking/adding user_id column:', error);
  } finally {
    pool.end();
  }
}

checkUserIdColumn(); 