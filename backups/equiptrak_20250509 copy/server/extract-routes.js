const fs = require('fs');

// Read the file
const filePath = './index.js';
const content = fs.readFileSync(filePath, 'utf8');

// Function to locate line numbers for key sections
function findLineNumbers() {
  const lines = content.split('\n');
  const positions = {
    secondBlockStart: -1,
    secondBlockEnd: -1
  };

  // Find the second Compressor CRUD Operations block
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('// Compressor CRUD Operations')) {
      positions.secondBlockStart = i;
      break;
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

if (positions.secondBlockStart === -1 || positions.secondBlockEnd === -1) {
  console.error('Could not find the second block of compressor routes');
  process.exit(1);
}

// Split into lines for easier manipulation
const lines = content.split('\n');

// Extract the second block (Compressor CRUD Operations)
const compressorBlock = lines.slice(positions.secondBlockStart, positions.secondBlockEnd + 1).join('\n');

// Save the compressor routes to a new file
fs.writeFileSync('./compressor-routes.js', `
// INSTRUCTIONS:
// 1. Copy this block BEFORE the catch-all route in index.js (around line 2527)
// 2. Delete the two problematic blocks:
//    - Lines ~2543-2687 (after server startup)
//    - Lines ~2690-2911 (the duplicate we extracted here)

${compressorBlock}
`);

console.log('Successfully extracted compressor routes to compressor-routes.js');
console.log('Please follow the instructions in that file to complete the fix manually.'); 