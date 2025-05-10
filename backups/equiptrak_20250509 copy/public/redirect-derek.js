// Script to redirect derek@acme.com to the Acme company page
(function() {
  console.log('Derek redirect script loaded');
  
  // Check if the current user is derek@acme.com
  const checkAndRedirect = async () => {
    try {
      // Try to get the current session
      const { data: { session } } = await window.supabase.auth.getSession();
      
      if (session && session.user && session.user.email === 'derek@acme.com') {
        console.log('Derek detected, redirecting to Acme company page');
        const acmeCompanyId = '0cd307a7-c938-49da-b005-17746587ca8a';
        window.location.href = `/admin/customer/${acmeCompanyId}`;
      } else {
        console.log('Not derek or not logged in');
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };
  
  // Force redirect to Acme company page
  const forceRedirect = () => {
    console.log('Forcing redirect to Acme company page');
    const acmeCompanyId = '0cd307a7-c938-49da-b005-17746587ca8a';
    window.location.href = `/admin/customer/${acmeCompanyId}`;
  };
  
  // Expose functions to window
  window.redirectDerek = {
    check: checkAndRedirect,
    force: forceRedirect
  };
  
  console.log('Derek redirect functions available:');
  console.log('- redirectDerek.check() - Check if derek is logged in and redirect');
  console.log('- redirectDerek.force() - Force redirect to Acme company page');
})(); 