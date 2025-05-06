/**
 * This script manually registers the spot-welders route in the server's index.js file
 */
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.js');

try {
  console.log('Reading index.js file...');
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Check if the route is already registered
  if (indexContent.includes('app.use(\'/api/spot-welders\'')) {
    console.log('Spot welders route is already registered in index.js');
    process.exit(0);
  }
  
  // Find the right insertion point - after compressor routes are defined
  const compressorRouteMatch = indexContent.match(/app\.use\('\/api\/compressors', compressorRoutes\);/);
  
  if (!compressorRouteMatch) {
    console.error('Could not find insertion point in index.js');
    process.exit(1);
  }
  
  const insertionPoint = compressorRouteMatch.index + compressorRouteMatch[0].length;
  
  // Code to insert
  const routeRegistration = `

// Register spot welders routes
const spotWelderRoutes = require('./routes/spot-welders').init(app);
app.use('/api/spot-welders', spotWelderRoutes);
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
  
  console.log('Successfully registered spot-welders route in index.js');
  console.log('Please restart the server for changes to take effect.');
  
} catch (error) {
  console.error('Error registering spot-welders route:', error);
  process.exit(1);
} 