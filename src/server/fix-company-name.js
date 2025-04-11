require('dotenv').config();
const { Pool } = require('pg');

// Create a new database pool using the DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

// Function to rename the column
async function renameColumn() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database, checking column status...');
    
    // Check if name column exists
    const nameColumnResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'name'
      ) as exists;
    `);
    
    // Check if company_name column exists
    const companyNameColumnResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'company_name'
      ) as exists;
    `);
    
    const nameColumnExists = nameColumnResult.rows[0].exists;
    const companyNameColumnExists = companyNameColumnResult.rows[0].exists;
    
    console.log(`Column status: name=${nameColumnExists}, company_name=${companyNameColumnExists}`);
    
    if (nameColumnExists && !companyNameColumnExists) {
      // Rename name to company_name
      console.log('Renaming name column to company_name...');
      await client.query(`ALTER TABLE companies RENAME COLUMN name TO company_name;`);
      console.log('Column renamed successfully');
    } else if (nameColumnExists && companyNameColumnExists) {
      // If both columns exist, move data from name to company_name if company_name is null
      console.log('Both name and company_name columns exist, transferring data...');
      await client.query(`
        UPDATE companies 
        SET company_name = name 
        WHERE company_name IS NULL OR company_name = '';
      `);
      
      // Then drop the name column
      console.log('Dropping duplicate name column...');
      await client.query(`ALTER TABLE companies DROP COLUMN name;`);
      console.log('Column dropped successfully');
    } else if (!nameColumnExists && !companyNameColumnExists) {
      // If neither column exists, add company_name
      console.log('Neither column exists, adding company_name column...');
      await client.query(`ALTER TABLE companies ADD COLUMN company_name TEXT NOT NULL DEFAULT '';`);
      console.log('Column added successfully');
    } else {
      console.log('No changes needed, company_name column already exists');
    }
    
    // Show the current structure of the companies table
    const tableInfo = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'companies'
      ORDER BY ordinal_position;
    `);
    
    console.log('Current table structure:');
    tableInfo.rows.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
    console.log('Database schema update completed');
  } catch (error) {
    console.error('Error updating database schema:', error);
  } finally {
    client.release();
    // Close the pool
    pool.end();
  }
}

// Run the function
renameColumn().catch(err => {
  console.error('Failed to run schema update:', err);
  process.exit(1);
}); 