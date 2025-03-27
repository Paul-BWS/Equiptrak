const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'testuser',
  password: process.env.POSTGRES_PASSWORD || 'testpass',
  host: process.env.POSTGRES_HOST || '185.25.144.64',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'equiptrak',
  ssl: false
});

async function createUsers() {
  try {
    // Hash the passwords
    const adminPasswordHash = await bcrypt.hash('admin@2024', 10);
    const userPasswordHash = await bcrypt.hash('user@2024', 10);
    
    // Check if we can connect and which tables exist
    const tableCheck = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Available tables:', tableCheck.rows.map(r => r.table_name).join(', '));
    
    // Check users table columns
    try {
      const userColumns = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
      console.log('Users table columns:', userColumns.rows.map(r => r.column_name).join(', '));
    } catch (err) {
      console.error('Error checking users table columns:', err.message);
    }
    
    // Try to create admin user
    console.log('Attempting to create admin user...');
    try {
      const adminResult = await pool.query(
        "INSERT INTO users (email, password_hash, first_name, last_name, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, email, role",
        ['admin@equiptrak.com', adminPasswordHash, 'Admin', 'User', 'admin']
      );
      console.log('Admin user created:', adminResult.rows[0]);
    } catch (adminError) {
      console.error('Error creating admin user in users table:', adminError.message);
      
      // Try contacts table as fallback
      try {
        const adminContactResult = await pool.query(
          "INSERT INTO contacts (email, password_hash, first_name, last_name, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, email, role",
          ['admin@equiptrak.com', adminPasswordHash, 'Admin', 'User', 'admin']
        );
        console.log('Admin user created in contacts table:', adminContactResult.rows[0]);
      } catch (contactError) {
        console.error('Error creating admin user in contacts table:', contactError.message);
      }
    }
    
    // Try to create regular user
    console.log('Attempting to create regular user...');
    try {
      const userResult = await pool.query(
        "INSERT INTO users (email, password_hash, first_name, last_name, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, email, role",
        ['user@equiptrak.com', userPasswordHash, 'Test', 'User', 'user']
      );
      console.log('Regular user created:', userResult.rows[0]);
    } catch (userError) {
      console.error('Error creating regular user in users table:', userError.message);
      
      // Try contacts table as fallback
      try {
        const userContactResult = await pool.query(
          "INSERT INTO contacts (email, password_hash, first_name, last_name, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, email, role",
          ['user@equiptrak.com', userPasswordHash, 'Test', 'User', 'user']
        );
        console.log('Regular user created in contacts table:', userContactResult.rows[0]);
      } catch (contactError) {
        console.error('Error creating regular user in contacts table:', contactError.message);
      }
    }
    
    // Check existing users
    console.log('\nChecking existing users...');
    try {
      const existingUsers = await pool.query("SELECT id, email, role FROM users");
      console.log('Users in users table:', existingUsers.rows);
    } catch (err) {
      console.error('Error checking users table:', err.message);
    }
    
    try {
      const existingContacts = await pool.query("SELECT id, email, role FROM contacts");
      console.log('Users in contacts table:', existingContacts.rows);
    } catch (err) {
      console.error('Error checking contacts table:', err.message);
    }

  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await pool.end();
    console.log('Done!');
  }
}

createUsers();
