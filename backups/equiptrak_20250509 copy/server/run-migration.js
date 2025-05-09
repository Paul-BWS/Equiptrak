// Script to run migrations
const path = require('path');
const fs = require('fs');

// Get migration name from command line
const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Please provide a migration name');
  console.error('Usage: node run-migration.js <migration-name>');
  console.error('Example: node run-migration.js add-unique-constraint-to-serial');
  process.exit(1);
}

// Check if migration file exists
const migrationPath = path.join(__dirname, 'migrations', `${migrationName}.js`);
if (!fs.existsSync(migrationPath)) {
  console.error(`Migration file not found: ${migrationPath}`);
  process.exit(1);
}

console.log(`Running migration: ${migrationName}`);

// Run the migration
require(migrationPath); 