/**
 * Utility script to check the structure of the compressor_records table
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkTables() {
  try {
    console.log('Checking for compressor tables in database...');
    
    // Check for both possible table names
    const results = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('compressor_records', 'compressors_records');
    `);
    
    if (results.rows.length === 0) {
      console.log('No compressor tables found. The migration may not have run yet.');
    } else {
      console.log('Found the following table(s):');
      results.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
    
    // Check the columns in the table(s) if they exist
    for (const row of results.rows) {
      const tableName = row.table_name;
      console.log(`\nColumns in ${tableName}:`);
      
      const columnResults = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);
      
      columnResults.rows.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`);
      });
    }
    
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the check
checkTables(); 