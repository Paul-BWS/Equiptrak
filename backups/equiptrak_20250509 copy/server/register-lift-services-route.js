/**
 * This script manually registers the lift-services route in the server's index.js file
 */
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.js');

try {
  console.log('Reading index.js file...');
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Check if the route is already registered
  if (indexContent.includes('app.use(\'/api/lift-services\'')) {
    console.log('Lift services route is already registered in index.js');
    process.exit(0);
  }
  
  // Find the right insertion point - before the catch-all route
  const insertionPoint = indexContent.indexOf('// Catch-all route');
  
  if (insertionPoint === -1) {
    console.error('Could not find insertion point in index.js');
    process.exit(1);
  }
  
  // Code to insert
  const routeRegistration = `
// Register lift services routes
const liftServiceRoutes = require('./routes/lift-services').init(app);
app.use('/api/lift-services', liftServiceRoutes);

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
  
  console.log('Successfully registered lift-services route in index.js');
  console.log('Please restart the server for changes to take effect.');
  
} catch (error) {
  console.error('Error registering lift-services route:', error);
  process.exit(1);
} 