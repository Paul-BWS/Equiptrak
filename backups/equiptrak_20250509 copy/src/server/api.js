const express = require('express');
const path = require('path');
const cors = require('cors');
const { pool } = require('./db');
require('dotenv').config();

const app = express();

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Make pool available to routes
app.locals.pool = pool;

// Import routes
const imagesRoutes = require('./routes/images');
const companiesRoutes = require('./routes/companies');
const serviceRecordsRoutes = require('./routes/service-records');

// Register routes
app.use('/api/images', imagesRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/service-records', serviceRecordsRoutes);

// Certificate number generator endpoint
app.get('/api/generate-certificate-number', async (req, res) => {
  try {
    console.log('Generating certificate number');
    
    try {
      // First try to use the sequence
      const result = await pool.query(
        `SELECT nextval('service_certificate_seq')::TEXT AS certificate_number`
      );
      
      const certificateNumber = `BWS-${result.rows[0].certificate_number}`;
      
      console.log(`Generated certificate number: ${certificateNumber}`);
      
      return res.json({ certificateNumber });
    } catch (dbError) {
      console.error('Error with sequence, using fallback:', dbError);
      
      // Fallback to timestamp-based number if there's an issue with the sequence
      const timestamp = Date.now().toString().slice(-6);
      const fallbackNumber = `BWS-${timestamp}`;
      
      console.log(`Generated fallback certificate number: ${fallbackNumber}`);
      
      return res.json({ certificateNumber: fallbackNumber });
    }
  } catch (error) {
    console.error(`Error generating certificate number: ${error.message}`);
    
    // Even if there's an error, return a certificate number so the form works
    const emergencyNumber = `BWS-EMG-${Date.now().toString().slice(-6)}`;
    
    return res.json({ 
      certificateNumber: emergencyNumber,
      error: error.message 
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running correctly!' });
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Print registered routes
console.log('Registered Routes:');
function printRoutes(stack, basePath = '') {
  stack.forEach(mw => {
    if (mw.route) { // routes registered directly on the app
      const methods = Object.keys(mw.route.methods).join(', ');
      console.log(`${methods.toUpperCase().padEnd(8)} ${basePath}${mw.route.path}`);
    } else if (mw.handle.stack) { // router middleware
      const newBase = basePath + (mw.regexp.toString().replace('/^\\', '').replace('\\/?(?=\\/|$)/i', '').replace(/\\/g, ''));
      printRoutes(mw.handle.stack, newBase);
    }
  });
}
printRoutes(app._router.stack);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ error: 'Something broke!', details: err.message });
});

// 404 handler - must be last
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: 'Not Found',
    path: req.url,
    method: req.method
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;