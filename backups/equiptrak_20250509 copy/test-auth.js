const fetch = require('node-fetch');

async function testAuth() {
  console.log('Testing authentication and API connectivity...');
  
  try {
    // Step 1: Try to log in
    console.log('Attempting to log in...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@equiptrak.com',
        password: 'admin@2024'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      console.error('Login failed:', loginData);
      return;
    }
    
    console.log('Login successful! User:', loginData.user.email);
    console.log('Token received:', loginData.token ? 'Yes' : 'No');
    
    // Step 2: Try to fetch companies with the token
    console.log('\nAttempting to fetch companies with the token...');
    const companiesResponse = await fetch('http://localhost:3001/api/companies', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    const companiesData = await companiesResponse.json();
    console.log('Companies response status:', companiesResponse.status);
    
    if (!companiesResponse.ok) {
      console.error('Fetching companies failed:', companiesData);
      return;
    }
    
    console.log('Companies fetched successfully!');
    console.log(`Found ${companiesData.length} companies`);
    
    // Output the token for the user to manually copy
    console.log('\n--------------------------------------------');
    console.log('AUTHENTICATION TOKEN (copy this for manual tests):');
    console.log(loginData.token);
    console.log('--------------------------------------------');
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testAuth(); 