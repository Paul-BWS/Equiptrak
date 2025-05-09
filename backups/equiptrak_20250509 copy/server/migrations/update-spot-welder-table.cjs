/**
 * Migration to update the spot_welder_records table
 * This script adds multiple machine reading fields and removes unused fields
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateSpotWelderTable() {
  const client = await pool.connect();
  
  try {
    console.log('Starting spot_welder_records table migration...');
    
    // Start transaction
    await client.query('BEGIN');
    
    // First check if the table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'spot_welder_records'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('Table spot_welder_records does not exist. Migration skipped.');
      await client.query('COMMIT');
      return;
    }
    
    // Check if old machine fields exist
    const machineColumnExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'spot_welder_records' AND column_name = 'machine'
      );
    `);
    
    if (machineColumnExists.rows[0].exists) {
      console.log('Migrating data from old machine fields to new fields...');
      
      // Rename old fields to machine1, meter1, etc.
      await client.query(`
        ALTER TABLE spot_welder_records
        ADD COLUMN IF NOT EXISTS machine1 VARCHAR(100),
        ADD COLUMN IF NOT EXISTS meter1 VARCHAR(100),
        ADD COLUMN IF NOT EXISTS machine_time1 VARCHAR(50),
        ADD COLUMN IF NOT EXISTS meter_time1 VARCHAR(50);
      `);
      
      // Copy data from old fields to new ones
      await client.query(`
        UPDATE spot_welder_records
        SET machine1 = machine,
            meter1 = meter,
            machine_time1 = machine_time,
            meter_time1 = meter_time;
      `);
    }
    
    // Add new machine reading fields if they don't exist
    await client.query(`
      ALTER TABLE spot_welder_records
      ADD COLUMN IF NOT EXISTS machine1 VARCHAR(100),
      ADD COLUMN IF NOT EXISTS meter1 VARCHAR(100),
      ADD COLUMN IF NOT EXISTS machine_time1 VARCHAR(50),
      ADD COLUMN IF NOT EXISTS meter_time1 VARCHAR(50),
      ADD COLUMN IF NOT EXISTS machine2 VARCHAR(100),
      ADD COLUMN IF NOT EXISTS meter2 VARCHAR(100),
      ADD COLUMN IF NOT EXISTS machine_time2 VARCHAR(50),
      ADD COLUMN IF NOT EXISTS meter_time2 VARCHAR(50),
      ADD COLUMN IF NOT EXISTS machine3 VARCHAR(100),
      ADD COLUMN IF NOT EXISTS meter3 VARCHAR(100),
      ADD COLUMN IF NOT EXISTS machine_time3 VARCHAR(50),
      ADD COLUMN IF NOT EXISTS meter_time3 VARCHAR(50),
      ADD COLUMN IF NOT EXISTS machine4 VARCHAR(100),
      ADD COLUMN IF NOT EXISTS meter4 VARCHAR(100),
      ADD COLUMN IF NOT EXISTS machine_time4 VARCHAR(50),
      ADD COLUMN IF NOT EXISTS meter_time4 VARCHAR(50);
    `);
    
    // Drop old machine fields if they exist
    if (machineColumnExists.rows[0].exists) {
      await client.query(`
        ALTER TABLE spot_welder_records
        DROP COLUMN IF EXISTS machine,
        DROP COLUMN IF EXISTS meter,
        DROP COLUMN IF EXISTS machine_time,
        DROP COLUMN IF EXISTS meter_time;
      `);
    }
    
    // Check if sent_on column exists
    const sentOnColumnExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'spot_welder_records' AND column_name = 'sent_on'
      );
    `);
    
    if (sentOnColumnExists.rows[0].exists) {
      // Drop sent_on column
      await client.query(`
        ALTER TABLE spot_welder_records
        DROP COLUMN IF EXISTS sent_on;
      `);
    }
    
    // Make sure status column exists with default 'Active'
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'spot_welder_records' AND column_name = 'status'
        ) THEN
          ALTER TABLE spot_welder_records
          ADD COLUMN status VARCHAR(50) DEFAULT 'Active' NOT NULL;
        END IF;
      END $$;
    `);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Successfully migrated spot_welder_records table');
    
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error('Error migrating spot_welder_records table:', error);
  } finally {
    client.release();
    // Close the pool
    await pool.end();
  }
}

// Run the migration
migrateSpotWelderTable(); 