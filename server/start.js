// EquipTrak - Clean Server Startup Script
// This script runs the simple-server.js which has all required endpoints
require('dotenv').config({ path: __dirname + '/.env' });
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting EquipTrak Server...');

function startServer() {
  // Kill any existing process on the specified port
  const PORT = process.env.PORT || 3001;
  console.log(`Checking for existing processes on port ${PORT}...`);
  const cleanup = spawn('kill', [`$(lsof -t -i:${PORT} || echo "") || true`], { shell: true });
  
  cleanup.on('exit', () => {
    console.log('Starting server process...');
    
    // Start the server as a child process using simple-server.js
    const server = spawn('node', [path.join(__dirname, 'simple-server.js')], {
      stdio: 'inherit',  // Redirect the child's stdio to the parent
      env: process.env
    });
    
    // Handle server exit
    server.on('exit', (code, signal) => {
      console.log(`Server process exited with code ${code} and signal ${signal}`);
      
      if (code !== 0) {
        console.log('Server crashed, restarting in 2 seconds...');
        setTimeout(startServer, 2000);
      }
    });
    
    // Handle errors
    server.on('error', (err) => {
      console.error('Failed to start server:', err);
      console.log('Trying again in 5 seconds...');
      setTimeout(startServer, 5000);
    });
  });
}

// Start the server
startServer();

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down server...');
  process.exit(0);
}); 