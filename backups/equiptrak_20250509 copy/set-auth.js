// Copy and paste this script into the browser console when on http://localhost:3000
// This will set a valid authentication token for development purposes

const userData = {
  id: "3f6d290d-7522-460b-87eb-57ee46a12e2e", // Make sure this ID exists in your database
  email: "admin@equiptrak.com",
  role: "admin",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzZjZkMjkwZC03NTIyLTQ2MGItODdlYi01N2VlNDZhMTJlMmUiLCJlbWFpbCI6ImFkbWluQGVxdWlwdHJhay5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDQzNDkyNDYsImV4cCI6MTc0NDQzNTY0Nn0.M_3cBZcQw7HHPumUj7FkHPsXhyOa4BApcV81bmg_NaE"
};

// Save to localStorage
localStorage.setItem('equiptrak_user', JSON.stringify(userData));

// Log confirmation
console.log('Authentication data set! Refresh the page to see if it worked.'); 