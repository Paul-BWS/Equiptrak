/**
 * This script manually registers the compressors route in the server's index.js file
 */
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.js');

try {
  console.log('Reading index.js file...');
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Check if the route is already registered
  if (indexContent.includes('app.use(\'/api/compressors\'')) {
    console.log('Compressors route is already registered in index.js');
    process.exit(0);
  }
  
  // Find a good insertion point - after authenticateToken middleware is defined
  // and before the test endpoint
  const testEndpointMatch = indexContent.match(/\/\/ Test endpoint/);
  
  if (!testEndpointMatch) {
    console.error('Could not find insertion point in index.js');
    process.exit(1);
  }
  
  const insertionPoint = testEndpointMatch.index;
  
  // Code to insert
  const routeRegistration = `
// Make the authentication middleware available to routes
app.locals.authenticateToken = authenticateToken;

// Register routes
const compressorRoutes = require('./routes/compressors').init(app);
app.use('/api/compressors', compressorRoutes);

`;
  
  // Insert the route registration
  const newContent = indexContent.slice(0, insertionPoint) + 
                    routeRegistration + 
                    indexContent.slice(insertionPoint);
  
  // Create a backup of the original file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '');
  const backupPath = path.join(__dirname, `index.js.backup_${timestamp}`);
  
  console.log(`Creating backup at ${backupPath}`);
  fs.writeFileSync(backupPath, indexContent);
  
  // Write the modified content back to index.js
  console.log('Writing updated index.js file...');
  fs.writeFileSync(indexPath, newContent);
  
  console.log('Successfully registered compressors route in index.js');
  console.log('Please restart the server for changes to take effect.');
  
} catch (error) {
  console.error('Error updating index.js file:', error);
  process.exit(1);
} 