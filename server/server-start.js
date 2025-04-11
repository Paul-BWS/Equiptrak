// A more resilient server startup script
require('dotenv').config({ path: __dirname + '/.env' });
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting server with auto-restart...');

function startServer() {
  // Kill any existing process on port 3001
  console.log('Checking for existing server processes...');
  const cleanup = spawn('kill', ['$(lsof -t -i:3001 || echo "") || true'], { shell: true });
  
  cleanup.on('exit', () => {
    console.log('Starting server process...');
    
    // Start the server as a child process
    const server = spawn('node', [path.join(__dirname, 'simple-server.js')], {
      stdio: 'inherit', // Redirect the child's stdio to the parent
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

process.on('SIGINT', () => {
  console.log('Received SIGINT, exiting...');
  process.exit(0);
}); 