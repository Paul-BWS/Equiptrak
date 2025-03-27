const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// JWT secret key - ensure it's using the one from .env
const JWT_SECRET = process.env.JWT_SECRET || 'equiptrak-secret-key-for-jwt-authentication';
console.log(`Using JWT_SECRET: ${JWT_SECRET.substring(0, 5)}... (from ${process.env.JWT_SECRET ? '.env file' : 'fallback value'})`);

// Production configuration
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const TOKEN_EXPIRY = IS_PRODUCTION ? '30d' : '168h'; // 30 days in production, 7 days in development
console.log(`Running in ${IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'} mode. Token expiry: ${TOKEN_EXPIRY}`);

// Enable CORS with credentials
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.VITE_POSTGRES_USER,
  password: process.env.VITE_POSTGRES_PASSWORD,
  host: process.env.VITE_POSTGRES_HOST,
  port: parseInt(process.env.VITE_POSTGRES_PORT || '5432'),
  database: process.env.VITE_POSTGRES_DB,
  ssl: false
});

// Initialize database
const initializeDatabase = async () => {
  try {
    // Test the connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    client.release();

    // Create companies table with all required columns
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        company_name TEXT,
        address TEXT,
        city TEXT,
        county TEXT,
        postcode TEXT,
        country TEXT,
        telephone TEXT,
        industry TEXT,
        website TEXT,
        contact_name TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        credit_rating TEXT,
        company_status TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Add indexes if they don't exist
      CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
      CREATE INDEX IF NOT EXISTS idx_companies_created ON companies(created_at);
    `);
    console.log('Companies table verified/created');

    // Check if test company exists
    const existingCompany = await pool.query(
      'SELECT id FROM companies WHERE name = $1',
      ['EquipTrak Admin']
    );

    if (existingCompany.rows.length === 0) {
      // Insert test company only if it doesn't exist
      await pool.query(`
        INSERT INTO companies (
          name,
          company_name,
          address,
          city,
          county,
          postcode,
          country,
          telephone,
          industry,
          website,
          contact_name,
          contact_email,
          contact_phone,
          company_status
        ) VALUES (
          'EquipTrak Admin',
          'EquipTrak Admin',
          '123 Admin Street',
          'London',
          'Greater London',
          'SW1A 1AA',
          'United Kingdom',
          '020 1234 5678',
          'Software',
          'www.equiptrak.com',
          'Admin User',
          'admin@equiptrak.com',
          '07700 900000',
          'Active'
        );
      `);
      console.log('Test company created');
    }

    console.log('✅ Database initialization completed');
    return true;
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
};

// Start server only after database is initialized
const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`
=================================
🚀 API Server Status:
- Port: ${PORT}
- Mode: ${process.env.NODE_ENV || 'development'}
- JWT Expiry: ${TOKEN_EXPIRY}
=================================
      `);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// API endpoints
app.get('/api/companies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching companies:', err);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const {
      company_name,
      address,
      city,
      county,
      postcode,
      country,
      telephone,
      industry,
      website,
      contact_name,
      contact_email,
      contact_phone
    } = req.body;

    const result = await pool.query(`
      INSERT INTO companies (
        name,
        company_name,
        address,
        city,
        county,
        postcode,
        country,
        telephone,
        industry,
        website,
        contact_name,
        contact_email,
        contact_phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      company_name,
      company_name,
      address,
      city,
      county,
      postcode,
      country,
      telephone,
      industry,
      website,
      contact_name,
      contact_email,
      contact_phone
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating company:', err);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// Start the server
startServer();