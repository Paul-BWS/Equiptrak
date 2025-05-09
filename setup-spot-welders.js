/**
 * This script sets up everything needed for the spot welders functionality
 */
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Setting up Spot Welders functionality ===');

// Run scripts in sequence
async function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`Running ${scriptPath}...`);
    
    const scriptProcess = spawn('node', [scriptPath], {
      stdio: 'inherit'
    });
    
    scriptProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`Successfully ran ${scriptPath}`);
        resolve();
      } else {
        console.error(`Error running ${scriptPath} (exit code: ${code})`);
        reject(new Error(`Script ${scriptPath} exited with code ${code}`));
      }
    });
    
    scriptProcess.on('error', (err) => {
      console.error(`Failed to start ${scriptPath}:`, err);
      reject(err);
    });
  });
}

async function setup() {
  try {
    // Make sure server scripts use CommonJS
    const serverScripts = [
      join(__dirname, 'server/create-spot-welder-table.js'),
      join(__dirname, 'server/register-spot-welders-route.js'),
      join(__dirname, 'server/check-spot-welder-table.js')
    ];
    
    // Check if scripts exist
    for (const script of serverScripts) {
      if (!fs.existsSync(script)) {
        console.error(`Script not found: ${script}`);
        console.log('Please make sure all required scripts are in the server directory');
        process.exit(1);
      }
    }
    
    // Step 1: Create the spot_welder_records table
    await runScript(serverScripts[0]);
    
    // Step 2: Register the spot-welders route in index.js
    await runScript(serverScripts[1]);
    
    // Step 3: Verify the setup
    await runScript(serverScripts[2]);
    
    console.log('\n=== Spot Welders Setup Completed Successfully ===');
    console.log('The following changes have been made:');
    console.log(' 1. Created spot_welder_records table in the database');
    console.log(' 2. Registered spot-welders API endpoints in server/index.js');
    console.log('\nTo complete the setup:');
    console.log(' 1. Restart the server: cd server && node index.js');
    console.log(' 2. Access the Spot Welders page at: http://localhost:5173/spot-welders?companyId=<company_id>');
    
  } catch (error) {
    console.error('\n=== Setup Failed ===');
    console.error(error);
    process.exit(1);
  }
}

setup(); 