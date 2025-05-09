// Script to check Supabase companies table
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseCompanies() {
  try {
    console.log('Connecting to Supabase...');
    
    // Check connection by getting the current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.log('Supabase auth status: Not authenticated');
    } else {
      console.log('Supabase auth status: Authenticated as', authData.user?.email || 'Unknown user');
    }
    
    // Get companies from Supabase
    console.log('\nFETCHING COMPANIES FROM SUPABASE:');
    console.log('================================');
    
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching companies from Supabase:', error.message);
      return;
    }
    
    if (!companies || companies.length === 0) {
      console.log('No companies found in Supabase.');
      return;
    }
    
    console.log(`Found ${companies.length} companies in Supabase:`);
    
    // Display companies
    companies.forEach((company, index) => {
      console.log(`\n[Company ${index + 1}]`);
      console.log(`ID: ${company.id}`);
      console.log(`Name: ${company.company_name || company.name || 'N/A'}`);
      console.log(`Address: ${company.address || 'N/A'}`);
      console.log(`City: ${company.city || 'N/A'}`);
      console.log(`County: ${company.county || 'N/A'}`);
      console.log(`Postcode: ${company.postcode || 'N/A'}`);
      console.log(`Country: ${company.country || 'N/A'}`);
      console.log(`Telephone: ${company.telephone || company.contact_phone || 'N/A'}`);
      console.log(`Created: ${new Date(company.created_at).toLocaleString()}`);
    });
    
    // Check table structure
    console.log('\nCHECKING SUPABASE TABLE STRUCTURE:');
    console.log('================================');
    
    // Get a sample company to check its structure
    if (companies.length > 0) {
      const sampleCompany = companies[0];
      console.log('Company table columns:');
      Object.keys(sampleCompany).forEach(key => {
        console.log(`- ${key}: ${typeof sampleCompany[key]} (${sampleCompany[key] === null ? 'null' : 'has value'})`);
      });
    }
    
  } catch (error) {
    console.error('Error checking Supabase companies:', error);
  }
}

// Run the function
checkSupabaseCompanies(); 