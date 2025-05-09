const fs = require('fs');

console.log('Starting cleanup of index.js...');

// Read the file
const filePath = './index.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Create backup
fs.writeFileSync(`${filePath}.backup_${Date.now()}`, content);
console.log('Backup created');

// 2. Remove routes by pattern matching
// Pattern 1: First block of compressor routes
const pattern1 = /\/\/ Add these endpoints near other equipment-related endpoints[\s\S]*?app\.get\('\/api\/compressors'[\s\S]*?client\.release\(\);\s*}\s*}\);/;
content = content.replace(pattern1, '');
console.log('First compressor routes block removed');

// Pattern 2: Second block of compressor routes
const pattern2 = /\/\/--------------------------------------------------\s*\/\/ Compressor CRUD Operations[\s\S]*?app\.delete\('\/api\/compressors\/\:id'[\s\S]*?res\.status\(500\)\.json\(\{ error: 'Internal server error' \}\);\s*}\s*}\s*}\);/;
content = content.replace(pattern2, '');
console.log('Second compressor routes block removed');

// 3. Save the file
fs.writeFileSync(filePath, content);
console.log('Successfully removed old compressor routes from index.js');
console.log('Please restart your server to use the new modular routes'); 