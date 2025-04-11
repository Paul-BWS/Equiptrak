// Load environment variables
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'testuser',
  password: process.env.POSTGRES_PASSWORD || 'testpass',
  host: process.env.POSTGRES_HOST || '185.25.144.64',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'equiptrak'
});

async function resetPassword() {
  try {
    console.log('Connecting to database...');
    
    // First, get the admin user
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['admin@equiptrak.com']
    );
    
    if (userResult.rows.length === 0) {
      console.log('Admin user not found');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('Found user:', { id: user.id, email: user.email });
    
    // Generate a new password hash
    const newPassword = 'admin@2024'; // Change this to a secure password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('Generated new password hash');
    
    // Update the user's password
    const updateResult = await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2 RETURNING *',
      [hashedPassword, user.id]
    );
    
    if (updateResult.rows.length > 0) {
      console.log('Password reset successful for:', updateResult.rows[0].email);
    } else {
      console.log('Password update failed');
    }
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    // Close the database connection
    pool.end();
  }
}

// Run the password reset function
resetPassword(); 