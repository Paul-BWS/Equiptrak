// Debug script for navigation testing
(function() {
  console.log('Debug script loaded');
  
  // Acme company ID
  const acmeCompanyId = '0cd307a7-c938-49da-b005-17746587ca8a';
  
  // Create navigation functions
  window.debugNav = {
    // Navigate to Acme company page
    goToAcme: function() {
      console.log('Navigating to Acme company page');
      window.location.href = `/admin/customer/${acmeCompanyId}`;
    },
    
    // Navigate to admin dashboard
    goToAdmin: function() {
      console.log('Navigating to admin dashboard');
      window.location.href = '/admin';
    },
    
    // Navigate to user dashboard
    goToDashboard: function() {
      console.log('Navigating to user dashboard');
      window.location.href = '/dashboard';
    },
    
    // Navigate to login page
    goToLogin: function() {
      console.log('Navigating to login page');
      window.location.href = '/';
    },
    
    // Get current path
    getCurrentPath: function() {
      console.log('Current path:', window.location.pathname);
      return window.location.pathname;
    },
    
    // Get Acme company ID
    getAcmeId: function() {
      console.log('Acme company ID:', acmeCompanyId);
      return acmeCompanyId;
    }
  };
  
  console.log('Debug navigation functions available:');
  console.log('- debugNav.goToAcme()');
  console.log('- debugNav.goToAdmin()');
  console.log('- debugNav.goToDashboard()');
  console.log('- debugNav.goToLogin()');
  console.log('- debugNav.getCurrentPath()');
  console.log('- debugNav.getAcmeId()');
})(); 