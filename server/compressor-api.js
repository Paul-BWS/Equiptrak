/**
 * Simple test server with just the compressors API
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(bodyParser.json());

// Database connection
const pool = new Pool({
  user: process.env.VITE_POSTGRES_USER,
  password: process.env.VITE_POSTGRES_PASSWORD,
  host: process.env.VITE_POSTGRES_HOST,
  port: process.env.VITE_POSTGRES_PORT,
  database: process.env.VITE_POSTGRES_DB
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Get compressors endpoint
app.get('/api/compressors', async (req, res) => {
  try {
    const companyId = req.query.company_id;
    console.log(`Fetching compressors for company ID: ${companyId}`);
    
    if (!companyId) {
      return res.status(400).json({ error: 'company_id is required' });
    }
    
    return res.json({ 
      message: 'API endpoint exists',
      companyId: companyId,
      sampleCompressors: [
        { id: 1, name: 'Test Compressor 1', status: 'valid' },
        { id: 2, name: 'Test Compressor 2', status: 'due soon' }
      ]
    });
  } catch (error) {
    console.error(`Error fetching compressors: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
});

// Create compressor endpoint
app.post('/api/compressors', async (req, res) => {
  try {
    console.log('REQUEST BODY:', JSON.stringify(req.body, null, 2));
    
    // Just echo back the request for now
    return res.status(201).json({ 
      message: 'API endpoint exists',
      received: req.body,
      id: 'test-id-' + Date.now()
    });
  } catch (error) {
    console.error(`Error creating compressor: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = 3456;
app.listen(PORT, () => {
  console.log(`Test API running at http://localhost:${PORT}`);
  console.log('Try these endpoints:');
  console.log(`- GET http://localhost:${PORT}/api/test`);
  console.log(`- GET http://localhost:${PORT}/api/compressors?company_id=test`);
  console.log(`- POST http://localhost:${PORT}/api/compressors`);
}); 