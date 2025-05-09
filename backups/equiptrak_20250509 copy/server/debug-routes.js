/**
 * Utility script to print all registered routes in the Express app
 */
const express = require('express');
const app = express();

// Add a test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint works' });
});

// Add compressor endpoint
app.get('/api/compressors', (req, res) => {
  res.json({ message: 'Compressors endpoint works' });
});

// Print all registered routes
console.log('Registered routes:');
app._router.stack.forEach(middleware => {
  if (middleware.route) {
    // Routes registered directly on the app
    console.log(`${middleware.route.stack[0].method.toUpperCase()} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    // Router middleware
    middleware.handle.stack.forEach(handler => {
      if (handler.route) {
        const method = handler.route.stack[0].method.toUpperCase();
        console.log(`${method} ${middleware.regexp} -> ${handler.route.path}`);
      }
    });
  }
});

// Start the server on a different port
const PORT = 3099;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('Try these endpoints:');
  console.log(`- GET http://localhost:${PORT}/api/test`);
  console.log(`- GET http://localhost:${PORT}/api/compressors`);
}); 