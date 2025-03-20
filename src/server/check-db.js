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

async function checkDatabase() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Connected to database');

    // Check if companies table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'companies'
      )
    `);
    console.log('Companies table exists:', tableCheck.rows[0].exists);

    // Get table structure
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'companies'
      ORDER BY ordinal_position
    `);
    console.log('Companies table structure:');
    console.table(tableInfo.rows);

    // Get sample data
    const sampleData = await client.query(`
      SELECT * FROM companies LIMIT 1
    `);
    console.log('Sample company data:');
    console.log(sampleData.rows[0]);

    // Try to insert a test company
    try {
      const testCompany = await client.query(`
        INSERT INTO companies (
          name, 
          address, 
          city, 
          county, 
          postcode, 
          country, 
          telephone, 
          industry, 
          website,
          contact_name, 
          contact_email, 
          contact_phone, 
          created_at, 
          updated_at
        )
        VALUES (
          'Test Company ' || NOW(), 
          '123 Test St', 
          'Test City', 
          'Test County', 
          'TE1 1ST', 
          'United Kingdom', 
          '01234567890', 
          'Testing', 
          'http://test.com',
          'Test Contact', 
          'test@example.com', 
          '07123456789',
          NOW(), 
          NOW()
        )
        RETURNING *
      `);
      console.log('Test company inserted successfully:', testCompany.rows[0]);
    } catch (error) {
      console.error('Error inserting test company:', error);
    }

    client.release();
  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    await pool.end();
  }
}

checkDatabase(); 