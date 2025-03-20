#!/usr/bin/env node
import { createTables, insertDefaultData } from './create-postgres-tables';

/**
 * Script to set up the PostgreSQL database for EquipTrak
 * This can be run from the command line
 */

async function setupDatabase() {
  console.log('Setting up PostgreSQL database for EquipTrak...');
  
  try {
    // Create tables
    const tablesCreated = await createTables();
    
    if (!tablesCreated) {
      console.error('Failed to create tables. Exiting...');
      process.exit(1);
    }
    
    console.log('Database setup complete!');
    console.log('You can now start the application and access it at http://localhost:3000');
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

// Run the script
setupDatabase(); 