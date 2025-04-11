// Load environment variables first
require('dotenv').config({ path: __dirname + '/.env' });

// Debug environment variables
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT || 3001);
console.log('Database connection:', process.env.POSTGRES_HOST);

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB
});

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] ${req.method} ${req.path}`);
  console.log('Request headers:', req.headers);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
    if (req.headers['content-type']) {
      console.log('Content-Type:', req.headers['content-type']);
    }
  }
  
  // Log response when it's sent
  const originalSend = res.send;
  res.send = function(body) {
    const endTime = new Date();
    const duration = endTime - startTime;
    
    // Call the original send function
    originalSend.call(this, body);
    
    // Log response
    console.log(`Response: ${res.statusCode} (${duration}ms)`);
  };
  
  next();
});

// Test connection to database
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Database connected successfully');
    done();
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  });
};

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email);
    
    // Find user in database
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = result.rows[0];
    console.log('Found user:', user);
    
    // For admin accounts in development, bypass password check
    if (process.env.NODE_ENV !== 'production' && user.role === 'admin') {
      console.log('Admin login detected, bypassing password check');
    } else {
      // Check password
      const passwordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!passwordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );
    
    console.log('Login successful for', user.role);
    
    // Return user info and token
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Company API Endpoints
app.get('/api/companies', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching all companies');
    const result = await pool.query('SELECT * FROM companies ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/companies/:id', authenticateToken, async (req, res) => {
  try {
    const companyId = req.params.id;
    console.log(`Fetching company with ID: ${companyId}`);
    
    const result = await pool.query('SELECT * FROM companies WHERE id = $1', [companyId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Contact API Endpoints
app.get('/api/companies/:id/contacts', authenticateToken, async (req, res) => {
  try {
    const companyId = req.params.id;
    console.log(`Fetching contacts for company ID: ${companyId}`);
    
    const result = await pool.query(
      'SELECT * FROM contacts WHERE company_id = $1 ORDER BY is_primary DESC, name',
      [companyId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Notes API Endpoints
app.get('/api/companies/:id/notes', authenticateToken, async (req, res) => {
  try {
    const companyId = req.params.id;
    console.log(`Fetching notes for company ID: ${companyId}`);
    
    const result = await pool.query(
      'SELECT * FROM notes WHERE company_id = $1 ORDER BY created_at DESC',
      [companyId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Service Records API Endpoints
// Define routes before the catch-all handler
console.log('Manually registering service-records routes...');

// GET service records endpoint
app.get('/api/service-records', authenticateToken, (req, res, next) => {
  console.log('GET /api/service-records route matched', req.query);
  try {
    const companyId = req.query.company_id;
    console.log(`Fetching service records for company ID: ${companyId}`);
    
    if (!companyId) {
      return res.status(400).json({ error: 'company_id is required' });
    }
    
    // Query for service records
    pool.query(
      `SELECT * FROM service_records WHERE company_id = $1 ORDER BY service_date DESC`,
      [companyId],
      (err, result) => {
        if (err) {
          console.error('Error fetching service records:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        
        console.log(`Found ${result.rows.length} service records for company ID ${companyId}`);
        res.json(result.rows);
      }
    );
  } catch (error) {
    console.error('Error in GET /api/service-records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST service records endpoint
app.post('/api/service-records', authenticateToken, (req, res) => {
  console.log('POST /api/service-records route matched with body:', req.body);
  try {
    // Validate required fields
    const { company_id, service_date, engineer_name } = req.body;
    
    if (!company_id) {
      return res.status(400).json({ error: 'company_id is required' });
    }
    
    if (!service_date) {
      return res.status(400).json({ error: 'service_date is required' });
    }
    
    if (!engineer_name) {
      return res.status(400).json({ error: 'engineer_name is required' });
    }
    
    // Generate certificate number
    const certificateNumber = `BWS-${Date.now().toString().slice(-6)}`;
    
    // Insert record into database with equipment fields
    const query = `
      INSERT INTO service_records (
        company_id,
        service_date,
        retest_date,
        engineer_name,
        certificate_number,
        notes,
        status,
        equipment1_name,
        equipment1_serial,
        equipment2_name,
        equipment2_serial,
        equipment3_name,
        equipment3_serial,
        equipment4_name,
        equipment4_serial,
        equipment5_name,
        equipment5_serial,
        equipment6_name,
        equipment6_serial,
        created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW()
      ) RETURNING *
    `;
    
    const values = [
      company_id,
      service_date,
      req.body.retest_date || null,
      engineer_name,
      certificateNumber,
      req.body.notes || '',
      req.body.status || 'valid',
      req.body.equipment1_name || '',
      req.body.equipment1_serial || '',
      req.body.equipment2_name || '',
      req.body.equipment2_serial || '',
      req.body.equipment3_name || '',
      req.body.equipment3_serial || '',
      req.body.equipment4_name || '',
      req.body.equipment4_serial || '',
      req.body.equipment5_name || '',
      req.body.equipment5_serial || '',
      req.body.equipment6_name || '',
      req.body.equipment6_serial || ''
    ];
    
    pool.query(query, values, (err, result) => {
      if (err) {
        console.error('Error creating service record:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
      }
      
      console.log('Service record created:', result.rows[0]);
      res.status(201).json(result.rows[0]);
    });
  } catch (error) {
    console.error('Error in POST /api/service-records:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Define routes more explicitly to ensure they match
console.log('Registered routes:');
console.log('- GET /api/service-records');
console.log('- POST /api/service-records');

// Move catch-all route to the end, after all specific routes are defined
app.use('*', (req, res) => {
  console.log(`Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Not Found',
    message: `The requested URL ${req.originalUrl} was not found on this server.`
  });
});

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Test endpoint: http://localhost:${port}/api/test`);
}); 