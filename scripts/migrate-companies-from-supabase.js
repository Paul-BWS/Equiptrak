// Script to migrate companies from Supabase to PostgreSQL
const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Supabase connection
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// PostgreSQL connection
const pool = new Pool({
  user: process.env.VITE_POSTGRES_USER || 'testuser',
  password: process.env.VITE_POSTGRES_PASSWORD || 'testpass',
  host: process.env.VITE_POSTGRES_HOST || '185.25.144.64',
  port: parseInt(process.env.VITE_POSTGRES_PORT || '5432'),
  database: process.env.VITE_POSTGRES_DB || 'equiptrak',
  ssl: false
});

async function migrateCompanies() {
  try {
    console.log('Starting migration of companies from Supabase to PostgreSQL...');
    
    // Step 1: Get companies from Supabase
    console.log('\nFetching companies from Supabase...');
    const { data: supabaseCompanies, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching companies from Supabase:', error.message);
      return;
    }
    
    if (!supabaseCompanies || supabaseCompanies.length === 0) {
      console.log('No companies found in Supabase to migrate.');
      return;
    }
    
    console.log(`Found ${supabaseCompanies.length} companies in Supabase.`);
    
    // Step 2: Check PostgreSQL companies table structure
    console.log('\nChecking PostgreSQL companies table structure...');
    const tableStructure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'companies'
      ORDER BY ordinal_position
    `);
    
    console.log('PostgreSQL companies table columns:');
    tableStructure.rows.forEach(column => {
      console.log(`- ${column.column_name} (${column.data_type})`);
    });
    
    // Step 3: Alter PostgreSQL table if needed to match Supabase structure
    console.log('\nUpdating PostgreSQL table structure if needed...');
    
    // Check if company_name column exists, if not rename name to company_name
    const hasCompanyNameColumn = tableStructure.rows.some(col => col.column_name === 'company_name');
    const hasNameColumn = tableStructure.rows.some(col => col.column_name === 'name');
    
    if (!hasCompanyNameColumn && hasNameColumn) {
      console.log('Renaming "name" column to "company_name"...');
      await pool.query('ALTER TABLE companies RENAME COLUMN name TO company_name');
    } else if (!hasCompanyNameColumn && !hasNameColumn) {
      console.log('Adding "company_name" column...');
      await pool.query('ALTER TABLE companies ADD COLUMN company_name TEXT');
    }
    
    // Add other columns if they don't exist
    const columnsToAdd = [
      { name: 'city', type: 'TEXT' },
      { name: 'county', type: 'TEXT' },
      { name: 'postcode', type: 'TEXT' },
      { name: 'country', type: 'TEXT' },
      { name: 'telephone', type: 'TEXT' },
      { name: 'website', type: 'TEXT' },
      { name: 'industry', type: 'TEXT' },
      { name: 'company_status', type: 'TEXT' }
    ];
    
    for (const column of columnsToAdd) {
      const columnExists = tableStructure.rows.some(col => col.column_name === column.name);
      if (!columnExists) {
        console.log(`Adding "${column.name}" column...`);
        await pool.query(`ALTER TABLE companies ADD COLUMN ${column.name} ${column.type}`);
      }
    }
    
    // Step 4: Migrate data from Supabase to PostgreSQL
    console.log('\nMigrating companies data...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const company of supabaseCompanies) {
      try {
        // Check if company already exists in PostgreSQL by ID
        const existingCompany = await pool.query('SELECT id FROM companies WHERE id = $1', [company.id]);
        
        if (existingCompany.rows.length > 0) {
          // Update existing company
          console.log(`Updating existing company: ${company.company_name} (${company.id})`);
          
          await pool.query(`
            UPDATE companies SET
              company_name = $1,
              address = $2,
              city = $3,
              county = $4,
              postcode = $5,
              country = $6,
              telephone = $7,
              website = $8,
              industry = $9,
              company_status = $10,
              updated_at = NOW()
            WHERE id = $11
          `, [
            company.company_name,
            company.address,
            company.city,
            company.county,
            company.postcode,
            company.country,
            company.telephone,
            company.website,
            company.industry,
            company.company_status,
            company.id
          ]);
        } else {
          // Insert new company
          console.log(`Inserting new company: ${company.company_name} (${company.id})`);
          
          await pool.query(`
            INSERT INTO companies (
              id, company_name, address, city, county, postcode, 
              country, telephone, website, industry, company_status,
              created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
            )
          `, [
            company.id,
            company.company_name,
            company.address,
            company.city,
            company.county,
            company.postcode,
            company.country,
            company.telephone,
            company.website,
            company.industry,
            company.company_status,
            company.created_at || new Date(),
            company.updated_at || new Date()
          ]);
        }
        
        successCount++;
      } catch (err) {
        console.error(`Error migrating company ${company.company_name} (${company.id}):`, err.message);
        errorCount++;
      }
    }
    
    console.log(`\nMigration complete: ${successCount} companies migrated successfully, ${errorCount} errors.`);
    
    // Step 5: Verify migration
    console.log('\nVerifying migration...');
    const pgCompanies = await pool.query('SELECT * FROM companies ORDER BY created_at DESC');
    console.log(`PostgreSQL now has ${pgCompanies.rows.length} companies.`);
    
    // Print the first few companies to verify
    console.log('\nSample of migrated companies in PostgreSQL:');
    pgCompanies.rows.slice(0, 3).forEach((company, index) => {
      console.log(`\n[Company ${index + 1}]`);
      console.log(`ID: ${company.id}`);
      console.log(`Name: ${company.company_name || 'N/A'}`);
      console.log(`Address: ${company.address || 'N/A'}`);
      console.log(`City: ${company.city || 'N/A'}`);
      console.log(`Postcode: ${company.postcode || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the migration
migrateCompanies(); 