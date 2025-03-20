   require('dotenv').config({ path: __dirname + '/.env' });
   const { createClient } = require('@supabase/supabase-js');

   const supabaseUrl = process.env.SUPABASE_URL;
   const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

   console.log('Testing Supabase connection...');
   console.log('Using URL:', supabaseUrl);
   console.log('Service key exists and length:', !!supabaseServiceKey, supabaseServiceKey.length);

   const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

   async function testConnection() {
     try {
       const { data, error } = await supabaseAdmin.auth.admin.listUsers({
         page: 1,
         perPage: 1
       });
       
       if (error) {
         console.error('Supabase connection test failed:', error);
         return;
       }
       
       console.log('Supabase connection successful!');
       console.log('Found', data.users.length, 'users');
     } catch (error) {
       console.error('Error testing Supabase connection:', error);
     }
   }

   testConnection();