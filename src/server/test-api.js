// Using dynamic import for node-fetch
import('node-fetch').then(async ({ default: fetch }) => {
  console.log('Testing API endpoint for adding a company...');
  
  const companyData = {
    company_name: "Acme Co Test",
    name: "Acme Co Test",
    telephone: "123-456-7890",
    address: "123 Main St",
    city: "Anytown",
    county: "Anycounty",
    postcode: "12345",
    country: "United Kingdom",
    industry: "Manufacturing",
    website: "https://acme.example.com"
  };
  
  try {
    console.log('Sending POST request to http://localhost:3001/api/companies');
    console.log('Request payload:', JSON.stringify(companyData, null, 2));
    
    const response = await fetch('http://localhost:3001/api/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyData),
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
      console.log('Company added successfully!');
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      console.error('Failed to add company');
    }
  } catch (error) {
    console.error('Error making request:', error.message);
  }
}).catch(err => console.error('Unhandled error:', err)); 