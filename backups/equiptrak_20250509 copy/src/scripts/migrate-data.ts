import { supabase } from '@/integrations/supabase/client';
import db from '@/lib/db';

/**
 * Migrate data from Supabase to PostgreSQL
 * This script can be run from the command line using ts-node
 * Example: npx ts-node -r tsconfig-paths/register src/scripts/migrate-data.ts
 */

// Tables to migrate
const TABLES = [
  'companies',
  'equipment_types',
  'equipment',
  'engineers',
  'service_records',
  'compressor_records',
  'spot_welder_records',
  'spot_welder_service_records',
  'loler_records',
  'loler_service_records',
  'rivet_tool_records',
  'rivet_tool_service_records',
  'fault_reports',
  'conversations',
  'messages',
  'notes'
];

/**
 * Check database connections
 */
async function checkConnections(): Promise<boolean> {
  try {
    // Check Supabase connection
    const { data: supabaseData, error: supabaseError } = await supabase.from('companies').select('count(*)', { count: 'exact' });
    
    if (supabaseError) {
      console.error('Supabase connection error:', supabaseError.message);
      return false;
    }
    
    // Check PostgreSQL connection
    try {
      await db.query('SELECT 1');
      console.log('PostgreSQL connection successful');
    } catch (pgError) {
      console.error('PostgreSQL connection error:', pgError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking connections:', error);
    return false;
  }
}

/**
 * Migrate a single table from Supabase to PostgreSQL
 */
async function migrateTable(tableName: string): Promise<void> {
  console.log(`Migrating table: ${tableName}`);
  
  try {
    // Check connections first
    const connectionsOk = await checkConnections();
    if (!connectionsOk) {
      throw new Error('Database connections failed. Please check your connection settings.');
    }
    
    // Get data from Supabase
    const { data, error } = await supabase.from(tableName).select('*');
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log(`No data found in table: ${tableName}`);
      return;
    }
    
    console.log(`Found ${data.length} records in table: ${tableName}`);
    
    // Delete existing data from PostgreSQL (optional)
    await db.query(`DELETE FROM ${tableName}`);
    
    // Insert data into PostgreSQL
    for (const record of data) {
      const columns = Object.keys(record);
      const values = Object.values(record);
      const placeholders = values.map((_, i) => `$${i + 1}`);
      
      const query = `
        INSERT INTO ${tableName} (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        ON CONFLICT DO NOTHING
      `;
      
      await db.query(query, values);
    }
    
    console.log(`Successfully migrated ${data.length} records to table: ${tableName}`);
  } catch (error) {
    console.error(`Error migrating table ${tableName}:`, error);
    throw error; // Re-throw to allow proper error handling in UI
  }
}

/**
 * Migrate all tables
 */
async function migrateAllTables(): Promise<void> {
  console.log('Starting migration from Supabase to PostgreSQL...');
  
  // Check connections first
  const connectionsOk = await checkConnections();
  if (!connectionsOk) {
    throw new Error('Database connections failed. Please check your connection settings.');
  }
  
  for (const table of TABLES) {
    try {
      await migrateTable(table);
    } catch (error) {
      console.error(`Error migrating table ${table}:`, error);
      // Continue with next table instead of stopping the entire process
    }
  }
  
  console.log('Migration completed!');
}

/**
 * Run the migration
 */
async function run(): Promise<void> {
  try {
    await migrateAllTables();
    // Don't call process.exit in browser environment
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    // Don't call process.exit in browser environment
  }
}

// This check doesn't work in the browser, so we'll remove it
// if (require.main === module) {
//   run();
// }

export { migrateTable, migrateAllTables, run }; 