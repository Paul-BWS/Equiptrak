/**
 * Script to run the spot welder table migration
 */
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Running spot welder table migration...');

const migrationScriptPath = join(__dirname, 'server', 'migrations', 'update-spot-welder-table.cjs');

exec(`node ${migrationScriptPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error running migration: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Migration stderr: ${stderr}`);
    return;
  }
  console.log(`Migration output: ${stdout}`);
}); 