// Migration script to add new lift service inspection fields
require('dotenv-safe').config({
  allowEmptyValues: true,
  path: require('path').resolve(__dirname, '../.env'),
  example: require('path').resolve(__dirname, '../.env.example')
});

const { Pool } = require('pg');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB
});

async function addNewFields() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration to add new lift service fields...');
    
    // Start transaction
    await client.query('BEGIN');
    
    // Check if the table has the new fields
    const columnCheck = await client.query(`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'lift_service_records'
      AND column_name = 'load_test';
    `);
    
    // Only proceed if the columns don't exist
    if (columnCheck.rows.length === 0) {
      console.log('Adding new fields to lift_service_records table...');
      
      // New status format fields
      await client.query(`
        ALTER TABLE lift_service_records
        ADD COLUMN IF NOT EXISTS safe_working_test_status TEXT,
        ADD COLUMN IF NOT EXISTS emergency_stops_test_status TEXT,
        ADD COLUMN IF NOT EXISTS limit_switches_test_status TEXT, 
        ADD COLUMN IF NOT EXISTS safety_devices_test_status TEXT,
        ADD COLUMN IF NOT EXISTS hydraulic_system_test_status TEXT,
        ADD COLUMN IF NOT EXISTS pressure_relief_test_status TEXT,
        ADD COLUMN IF NOT EXISTS electrical_system_test_status TEXT,
        ADD COLUMN IF NOT EXISTS platform_operation_test_status TEXT,
        ADD COLUMN IF NOT EXISTS fail_safe_devices_test_status TEXT,
        ADD COLUMN IF NOT EXISTS lifting_structure_test_status TEXT;
      `);
      
      // New inspection fields
      await client.query(`
        ALTER TABLE lift_service_records
        ADD COLUMN IF NOT EXISTS load_test TEXT,
        ADD COLUMN IF NOT EXISTS tension_suspension_rope TEXT,
        ADD COLUMN IF NOT EXISTS tension_foundation_bolt TEXT,
        ADD COLUMN IF NOT EXISTS tension_column_bolt TEXT,
        ADD COLUMN IF NOT EXISTS tension_platform_bolt TEXT,
        ADD COLUMN IF NOT EXISTS cable_pulley TEXT,
        ADD COLUMN IF NOT EXISTS drive_belt_chains TEXT,
        ADD COLUMN IF NOT EXISTS hydraulic_connections TEXT,
        ADD COLUMN IF NOT EXISTS oil_levels TEXT,
        ADD COLUMN IF NOT EXISTS guide_rollers TEXT,
        ADD COLUMN IF NOT EXISTS wheel_free_systems TEXT,
        ADD COLUMN IF NOT EXISTS limit_devices TEXT,
        ADD COLUMN IF NOT EXISTS arm_locks TEXT,
        ADD COLUMN IF NOT EXISTS safety_devices TEXT,
        ADD COLUMN IF NOT EXISTS clean_safety_rods TEXT,
        ADD COLUMN IF NOT EXISTS auto_chocks_fixed_stops TEXT,
        ADD COLUMN IF NOT EXISTS anti_toe_chocks TEXT,
        ADD COLUMN IF NOT EXISTS lift_markings_swl TEXT,
        ADD COLUMN IF NOT EXISTS lifting_arms_pads TEXT,
        ADD COLUMN IF NOT EXISTS air_safety_locks TEXT,
        ADD COLUMN IF NOT EXISTS column_alignment TEXT,
        ADD COLUMN IF NOT EXISTS electrical_check TEXT,
        ADD COLUMN IF NOT EXISTS dead_man_controls TEXT,
        ADD COLUMN IF NOT EXISTS guards_fixings TEXT,
        ADD COLUMN IF NOT EXISTS main_screw_load_safety_nuts TEXT;
      `);
      
      // Boolean fields
      await client.query(`
        ALTER TABLE lift_service_records
        ADD COLUMN IF NOT EXISTS load_test_conducted BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS equipment_out_of_action BOOLEAN DEFAULT FALSE;
      `);
      
      console.log('New fields added successfully!');
    } else {
      console.log('New fields already exist, skipping migration.');
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during migration:', error);
  } finally {
    client.release();
    pool.end();
  }
}

// Run the migration
addNewFields(); 