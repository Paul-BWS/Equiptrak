/**
 * Database Connection Test Script
 * 
 * This script tests the connection to your SQL Server from your deployment environment.
 * Run this script to verify that your hosting environment can successfully connect to your on-premises SQL server.
 * 
 * Usage: node test-db-connection.js
 */

require('dotenv').config();
const { Pool } = require('pg');

// Get connection details from environment variables or use defaults
const connectionConfig = {
  user: process.env.DB_USER || 'your_username',
  host: process.env.DB_HOST || 'your_host_ip',
  database: process.env.DB_NAME || 'your_database',
  password: process.env.DB_PASSWORD || 'your_password',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  // Set a short timeout to quickly detect connection issues
  connectionTimeoutMillis: 5000,
};

console.log('\x1b[33m%s\x1b[0m', '🔍 Testing database connection...');
console.log('\x1b[36m%s\x1b[0m', `Host: ${connectionConfig.host}`);
console.log('\x1b[36m%s\x1b[0m', `Database: ${connectionConfig.database}`);
console.log('\x1b[36m%s\x1b[0m', `Port: ${connectionConfig.port}`);

// Create a new pool instance
const pool = new Pool(connectionConfig);

async function testConnection() {
  let client;
  
  try {
    // Try to connect to the database
    console.log('\x1b[33m%s\x1b[0m', 'Attempting to connect to the database...');
    client = await pool.connect();
    
    // If successful, try a simple query
    console.log('\x1b[32m%s\x1b[0m', '✅ Successfully connected to the database!');
    console.log('\x1b[33m%s\x1b[0m', 'Testing a simple query...');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('\x1b[32m%s\x1b[0m', '✅ Query executed successfully!');
    console.log('\x1b[36m%s\x1b[0m', `Server time: ${result.rows[0].current_time}`);
    
    // Test a specific table if needed
    console.log('\x1b[33m%s\x1b[0m', 'Testing access to the contacts table...');
    const tableTest = await client.query('SELECT COUNT(*) FROM contacts');
    console.log('\x1b[32m%s\x1b[0m', '✅ Table access successful!');
    console.log('\x1b[36m%s\x1b[0m', `Number of contacts: ${tableTest.rows[0].count}`);
    
    console.log('\x1b[32m%s\x1b[0m', '✅ All tests passed. Your database connection is working properly!');
    
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Database connection failed:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\x1b[31m%s\x1b[0m', '  - Connection refused. This usually means:');
      console.error('\x1b[31m%s\x1b[0m', '    • The database server is not running');
      console.error('\x1b[31m%s\x1b[0m', '    • Your firewall is blocking the connection');
      console.error('\x1b[31m%s\x1b[0m', '    • The host or port is incorrect');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\x1b[31m%s\x1b[0m', '  - Connection timed out. This usually means:');
      console.error('\x1b[31m%s\x1b[0m', '    • Your network can\'t reach the database server');
      console.error('\x1b[31m%s\x1b[0m', '    • A firewall is blocking the connection');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\x1b[31m%s\x1b[0m', '  - Host not found. This usually means:');
      console.error('\x1b[31m%s\x1b[0m', '    • The hostname is incorrect');
      console.error('\x1b[31m%s\x1b[0m', '    • DNS resolution failed');
    } else if (error.code === '28P01') {
      console.error('\x1b[31m%s\x1b[0m', '  - Authentication failed. This usually means:');
      console.error('\x1b[31m%s\x1b[0m', '    • Incorrect username or password');
    } else if (error.code === '3D000') {
      console.error('\x1b[31m%s\x1b[0m', '  - Database does not exist. This usually means:');
      console.error('\x1b[31m%s\x1b[0m', '    • The database name is incorrect');
      console.error('\x1b[31m%s\x1b[0m', '    • The database has not been created');
    } else {
      console.error('\x1b[31m%s\x1b[0m', `  - Error details: ${error.message}`);
    }
    
    console.error('\x1b[33m%s\x1b[0m', '\nTroubleshooting tips:');
    console.error('\x1b[33m%s\x1b[0m', '1. Check your .env file for correct database credentials');
    console.error('\x1b[33m%s\x1b[0m', '2. Verify your SQL Server allows remote connections');
    console.error('\x1b[33m%s\x1b[0m', '3. Check firewall settings on both your server and hosting provider');
    console.error('\x1b[33m%s\x1b[0m', '4. Make sure your hosting provider allows outbound connections to your IP');
  } finally {
    // Always release the client
    if (client) {
      client.release();
    }
    
    // End the pool
    await pool.end();
  }
}

// Run the test
testConnection(); 