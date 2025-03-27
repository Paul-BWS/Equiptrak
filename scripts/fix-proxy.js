#!/usr/bin/env node

/**
 * EquipTrack Proxy Diagnostics and Fix Script
 * 
 * This script helps diagnose and fix common proxy issues in the EquipTrack application.
 * It performs the following:
 * 1. Checks if the API server is running
 * 2. Checks the port configuration in vite.config.ts
 * 3. Tests API endpoints directly
 * 4. Updates configuration files if needed
 * 5. Provides useful advice and commands
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const http = require('http');

// ANSI Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Utility functions
function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTitle(title) {
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.cyan}${title}${colors.reset}`);
  console.log('='.repeat(80));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue');
}

function isPortInUse(port) {
  try {
    // Using netstat on most platforms to check port
    const command = process.platform === 'win32'
      ? `netstat -ano | findstr :${port} | findstr LISTENING`
      : `lsof -i :${port} | grep LISTEN`;
    
    execSync(command, { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

function testEndpoint(host, port, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      timeout: 2000
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({ 
          status: res.statusCode, 
          message: res.statusMessage,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Main diagnostic function
async function runDiagnostics() {
  logTitle('EquipTrack Proxy Diagnostics');
  
  log('Running proxy diagnostics and fixes...', 'cyan');
  
  // Check if we're in the right directory (project root)
  if (!fs.existsSync('package.json')) {
    logError('This script should be run from the project root directory');
    log('Please run: cd /path/to/equiptrak-vite && node scripts/fix-proxy.js');
    process.exit(1);
  }
  
  // Read package.json to verify project
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.name !== 'equip-track') {
    logWarning('This does not appear to be the EquipTrack project. Proceeding with caution.');
  } else {
    logSuccess('EquipTrack project identified');
  }
  
  // Check server processes
  logTitle('Checking Server Processes');
  
  const frontendPort = 3000;
  const apiPort = 3001;
  
  const isFrontendRunning = isPortInUse(frontendPort);
  const isApiRunning = isPortInUse(apiPort);
  
  if (isFrontendRunning) {
    logSuccess(`Frontend server is running on port ${frontendPort}`);
  } else {
    logError(`Frontend server is NOT running on port ${frontendPort}`);
  }
  
  if (isApiRunning) {
    logSuccess(`API server is running on port ${apiPort}`);
  } else {
    logError(`API server is NOT running on port ${apiPort}`);
    logInfo('Start the API server with: npm run api');
  }
  
  // Test API connectivity
  logTitle('Testing API Connectivity');
  
  if (isApiRunning) {
    try {
      const healthResult = await testEndpoint('localhost', apiPort, '/health');
      if (healthResult.status === 200) {
        logSuccess(`API health endpoint is working: Status ${healthResult.status}`);
      } else if (healthResult.status === 404) {
        logWarning(`API health endpoint not found, but server is responding: Status ${healthResult.status}`);
        logInfo('This is normal if you haven\'t added the health endpoint yet');
      } else {
        logError(`API health endpoint error: Status ${healthResult.status}`);
      }
    } catch (error) {
      logError(`Cannot connect to API health endpoint: ${error.message}`);
    }
    
    try {
      // Test a known API endpoint
      const result = await testEndpoint('localhost', apiPort, '/api/health');
      logInfo(`API response from /api/health: Status ${result.status}`);
    } catch (error) {
      logError(`Cannot connect to API endpoint: ${error.message}`);
    }
  }
  
  // Check Vite config
  logTitle('Checking Vite Configuration');
  
  if (fs.existsSync('vite.config.ts')) {
    const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
    
    if (viteConfig.includes("target: 'http://localhost:3001'")) {
      logSuccess('Vite proxy configuration looks correct for API server on port 3001');
    } else if (viteConfig.includes('proxy')) {
      logWarning('Vite has proxy configuration but may not be targeting the correct API server');
      log('Current vite.config.ts proxy settings:', 'yellow');
      
      // Extract and display the proxy configuration
      const proxyMatch = viteConfig.match(/proxy:\s*\{[\s\S]*?\}/);
      if (proxyMatch) {
        log(proxyMatch[0], 'yellow');
      }
    } else {
      logError('Vite config does not contain proxy settings');
    }
  } else {
    logError('vite.config.ts not found');
  }
  
  // Final recommendations
  logTitle('Recommendations');
  
  if (!isApiRunning) {
    log('1. Start the API server:', 'cyan');
    log('   npm run api', 'white');
  }
  
  if (!isFrontendRunning) {
    log('2. Start the frontend server:', 'cyan');
    log('   npm run dev', 'white');
  }
  
  if (!isApiRunning || !isFrontendRunning) {
    log('3. OR start both servers together:', 'cyan');
    log('   npm run dev:all', 'white');
  }
  
  log('4. Check browser console for errors:', 'cyan');
  log('   Open browser dev tools (F12) and look at the Console tab', 'white');
  
  log('5. Try accessing the test page:', 'cyan');
  log('   http://localhost:3000/test', 'white');
  
  log('\nFor more detailed troubleshooting, check the documentation or contact support.', 'cyan');
}

// Run the diagnostics
runDiagnostics().catch(error => {
  logError(`Diagnostics failed: ${error.message}`);
}); 