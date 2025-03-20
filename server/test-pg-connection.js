require('dotenv').config();
const db = require('./db-config');

console.log('Attempting to connect to PostgreSQL with these settings:');
console.log('Host:', process.env.POSTGRES_HOST);
console.log('Port:', process.env.POSTGRES_PORT);
console.log('Database:', process.env.POSTGRES_DB);
console.log('User:', process.env.POSTGRES_USER);
console.log('Password:', process.env.POSTGRES_PASSWORD ? '******' : 'not set');

async function testConnection() {
  try {
    console.log('Connecting to PostgreSQL...');
    const result = await db.query('SELECT NOW()');
    console.log('PostgreSQL connection successful!');
    console.log('Current timestamp from database:', result.rows[0].now);
    
    // Test creating a table
    console.log('Creating test table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS connection_test (
        id SERIAL PRIMARY KEY,
        test_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Test table created successfully');
    
    // Insert a test record
    console.log('Inserting test record...');
    await db.query(`
      INSERT INTO connection_test (test_name) VALUES ($1)
    `, ['Connection test ' + new Date().toISOString()]);
    console.log('Test record inserted successfully');
    
    // Query the test records
    console.log('Querying test records...');
    const testRecords = await db.query('SELECT * FROM connection_test');
    console.log('Test records:', testRecords.rows);
    
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. This could be due to:');
      console.error('1. PostgreSQL is not running on the specified host/port');
      console.error('2. A firewall is blocking the connection');
      console.error('3. The host or port is incorrect');
    }
    
    if (error.code === 'ETIMEDOUT') {
      console.error('Connection timed out. This could be due to:');
      console.error('1. The host is unreachable');
      console.error('2. A firewall is blocking the connection');
      console.error('3. The host is incorrect');
    }
    
    if (error.code === '28P01') {
      console.error('Authentication failed. This could be due to:');
      console.error('1. Incorrect username or password');
      console.error('2. PostgreSQL is not configured to allow this authentication method');
    }
    
    if (error.code === '3D000') {
      console.error('Database does not exist. This could be due to:');
      console.error('1. The database name is incorrect');
      console.error('2. The database has not been created');
    }
  } finally {
    // Close the connection pool
    db.pool.end();
  }
}

testConnection(); 