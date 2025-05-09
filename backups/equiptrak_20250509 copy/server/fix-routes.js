const fs = require('fs');

// Read the file
const filePath = './index.js';
let content = fs.readFileSync(filePath, 'utf8');

// Function to locate line numbers for key sections
function findLineNumbers() {
  const lines = content.split('\n');
  const positions = {
    firstBlockStart: -1,
    firstBlockEnd: -1,
    secondBlockStart: -1,
    secondBlockEnd: -1,
    catchAllRoute: -1
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Find the first block
    if (line.includes('// Add these endpoints near other equipment-related endpoints')) {
      positions.firstBlockStart = i;
    }
    
    // Find the second Compressor CRUD Operations block
    if (line.includes('// Compressor CRUD Operations')) {
      positions.secondBlockStart = i;
    }
    
    // Find catch-all route
    if (line.includes('// Catch-all route for unmatched routes')) {
      positions.catchAllRoute = i;
    }
  }

  // Find the end of the first block - it's the first app.post for compressors
  if (positions.firstBlockStart !== -1) {
    for (let i = positions.firstBlockStart; i < lines.length; i++) {
      if (lines[i].includes("client.release();") && lines[i+1]?.includes("}") && lines[i+2]?.includes("});")) {
        positions.firstBlockEnd = i + 2;
        break;
      }
    }
  }
  
  // Find the end of the second block - after all CRUD operations
  if (positions.secondBlockStart !== -1) {
    let openBraces = 0;
    let foundDelete = false;
    
    for (let i = positions.secondBlockStart; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('// Delete a compressor record')) {
        foundDelete = true;
      }
      
      if (foundDelete && line.includes('app.delete')) {
        // Count braces to find the end of this function
        openBraces = 1; // Starting with 1 for the app.delete function
        for (let j = i + 1; j < lines.length; j++) {
          const curLine = lines[j];
          openBraces += (curLine.match(/\{/g) || []).length;
          openBraces -= (curLine.match(/\}/g) || []).length;
          
          // When openBraces reaches 0, we've found the end of the delete function
          if (openBraces === 0) {
            positions.secondBlockEnd = j;
            break;
          }
        }
        break;
      }
    }
  }
  
  return positions;
}

const positions = findLineNumbers();
console.log('Found positions:', positions);

if (positions.firstBlockStart === -1 || positions.firstBlockEnd === -1) {
  console.error('Could not find the first block of compressor routes');
  process.exit(1);
}

if (positions.secondBlockStart === -1 || positions.secondBlockEnd === -1) {
  console.error('Could not find the second block of compressor routes');
  process.exit(1);
}

if (positions.catchAllRoute === -1) {
  console.error('Could not find the catch-all route');
  process.exit(1);
}

// Split into lines for easier manipulation
const lines = content.split('\n');

// Extract the second block (Compressor CRUD Operations)
const compressorBlock = lines.slice(positions.secondBlockStart, positions.secondBlockEnd + 1).join('\n');

// Remove the first block
lines.splice(positions.firstBlockStart, positions.firstBlockEnd - positions.firstBlockStart + 1);

// Remove the second block (it will be different indices after removing the first block)
const secondBlockOffset = positions.firstBlockEnd - positions.firstBlockStart + 1;
lines.splice(positions.secondBlockStart - secondBlockOffset, positions.secondBlockEnd - positions.secondBlockStart + 1);

// Add the second block before the catch-all route
const catchAllOffset = secondBlockOffset + (positions.secondBlockEnd - positions.secondBlockStart + 1);
lines.splice(positions.catchAllRoute - catchAllOffset, 0, compressorBlock);

// Join back and save
const modifiedContent = lines.join('\n');
fs.writeFileSync(filePath, modifiedContent);

console.log('Successfully fixed the routes in index.js'); 