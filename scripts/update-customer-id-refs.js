const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript/TSX files
function findTypeScriptFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findTypeScriptFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to update customer_id references to company_id
function updateCustomerIdRefs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Update type definitions
  content = content.replace(/customer_id\??: string/g, 'company_id?: string');
  content = content.replace(/customer_id: string/g, 'company_id: string');
  
  // Update variable references
  content = content.replace(/customer_id:/g, 'company_id:');
  content = content.replace(/customerId:/g, 'companyId:');
  
  // Update function parameters
  content = content.replace(/customerId\??: string/g, 'companyId?: string');
  content = content.replace(/customerId: string/g, 'companyId: string');
  
  // Update variable names
  content = content.replace(/const customerId/g, 'const companyId');
  content = content.replace(/let customerId/g, 'let companyId');
  
  // Update Supabase queries
  content = content.replace(/\.eq\("customer_id"/g, '.eq("company_id"');
  content = content.replace(/profiles:customer_id/g, 'profiles:company_id');
  content = content.replace(/companies:customer_id/g, 'companies:company_id');
  
  // Only write if changes were made
  if (content !== originalContent) {
    console.log(`Updating ${filePath}`);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// Main execution
const srcDir = path.join(__dirname, '..', 'src');
const files = findTypeScriptFiles(srcDir);

console.log('Found', files.length, 'TypeScript files');
files.forEach(file => updateCustomerIdRefs(file));
console.log('Update complete'); 