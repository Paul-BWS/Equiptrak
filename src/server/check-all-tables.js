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

async function checkAllTables() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Connected to database');

    // Get all tables in the public schema
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('Tables in database:');
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(tables);
    
    // For each table, get its structure
    for (const table of tables) {
      console.log(`\n=== Table: ${table} ===`);
      
      // Get column information
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      
      console.log('Columns:');
      console.table(columnsResult.rows);
      
      // Get row count
      const countResult = await client.query(`
        SELECT COUNT(*) FROM ${table}
      `);
      
      console.log(`Row count: ${countResult.rows[0].count}`);
      
      // Get sample data (first row)
      if (countResult.rows[0].count > 0) {
        const sampleResult = await client.query(`
          SELECT * FROM ${table} LIMIT 1
        `);
        
        console.log('Sample row:');
        console.log(sampleResult.rows[0]);
      }
    }

    client.release();
  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    await pool.end();
  }
}

checkAllTables(); 