const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// CORS Configuration - needs to be before any route definitions
app.use(function(req, res, next) {
  // Get origin from request headers or use localhost as fallback
  const origin = req.headers.origin || 'http://localhost:3000';
  
  // Allow specific origins instead of wildcard
  res.header('Access-Control-Allow-Origin', origin);
  
  // Allow credentials
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Allow specific methods
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Allow specific headers
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Body parsers - should come after CORS but before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.VITE_POSTGRES_USER || 'testuser',
  password: process.env.VITE_POSTGRES_PASSWORD || 'testpass',
  host: process.env.VITE_POSTGRES_HOST || '185.25.144.64',
  port: parseInt(process.env.VITE_POSTGRES_PORT || '5432'),
  database: process.env.VITE_POSTGRES_DB || 'equiptrak',
  ssl: false
});

// Test database connection
pool.connect()
  .then(async () => {
    console.log('Connected to PostgreSQL database at:', new Date().toISOString());
    try {
      // Drop and recreate users table
      await pool.query(`
        DROP TABLE IF EXISTS users CASCADE;
        
        CREATE TABLE users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          first_name TEXT,
          last_name TEXT,
          company_id UUID,
          role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          last_login TIMESTAMP WITH TIME ZONE
        );
      `);

      // Drop and recreate contacts table
      await pool.query(`
        DROP TABLE IF EXISTS contacts CASCADE;
        
        CREATE TABLE contacts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT,
          password_hash TEXT,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          company_id UUID,
          telephone TEXT,
          mobile TEXT,
          job_title TEXT,
          is_primary BOOLEAN DEFAULT false,
          has_system_access BOOLEAN DEFAULT false,
          role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          last_login TIMESTAMP WITH TIME ZONE
        );

        -- Add unique constraint for email only if has_system_access is true
        CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_email_system_access 
        ON contacts (email) 
        WHERE has_system_access = true AND email IS NOT NULL;

        -- Remove the strict password_hash constraint and make it conditional
        ALTER TABLE contacts DROP CONSTRAINT IF EXISTS check_system_access_password;
        ALTER TABLE contacts ADD CONSTRAINT check_system_access_password
        CHECK (
          (has_system_access = false) OR
          (has_system_access = true AND password_hash IS NOT NULL)
        );
      `);

      console.log('Database schema updated successfully');
    } catch (err) {
      console.error('Error updating database schema:', err);
    }
  })
  .catch(err => console.error('Database connection error:', err));

// Helper function for database queries
const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookies
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('Token verification failed:', err.message);
        return res.status(403).json({ error: 'Forbidden: Invalid token' });
      }
      
      console.log('Token verified for user:', decoded.email);
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  console.log('Received login request:', {
    body: req.body,
    headers: {
      'content-type': req.headers['content-type'],
      'origin': req.headers['origin']
    }
  });
  
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // First check contacts table (which is now the main user table)
    const contacts = await query(
      `SELECT id, email, password_hash, first_name, last_name, company_id, role, has_system_access
       FROM contacts 
       WHERE email = $1 AND has_system_access = true`,
      [email]
    );

    console.log(`Found ${contacts.length} contacts with email ${email}`);

    // If user found in contacts
    if (contacts.length > 0) {
      const user = contacts[0];
      
      // Log password attempt for debugging
      console.log('Attempting to verify password for user:', email);
      console.log('Password provided:', password);
      console.log('Password hash in DB:', user.password_hash ? 'Hash exists' : 'No hash found');
      
      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      console.log('Password verification result:', validPassword);
      
      if (!validPassword) {
        console.log('Invalid password for user:', email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last_login timestamp
      try {
        await query(
          `UPDATE contacts SET last_login = NOW() WHERE id = $1`,
          [user.id]
        );
        console.log('Updated last_login timestamp for user:', email);
      } catch (err) {
        console.log('Failed to update last_login but continuing:', err.message);
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          role: user.role || 'user',
          company_id: user.company_id
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Return user data without sensitive information
      const userData = {
        id: user.id,
        email: user.email,
        role: user.role || 'user',
        company_id: user.company_id,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || email
      };

      console.log('Login successful (contacts):', {
        email: userData.email,
        role: userData.role,
        id: userData.id
      });

      return res.status(200).json({
        user: userData,
        token
      });
    }

    // Fall back to legacy users table if not found in contacts
    const users = await query(
      `SELECT id, email, password_hash, first_name, last_name, company_id, role
       FROM users 
       WHERE email = $1`,
      [email]
    );

    console.log(`Found ${users.length} users with email ${email}`);

    if (users.length === 0) {
      console.log('No user found with email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Try to update last_login timestamp
    try {
      await query(
        `UPDATE users SET last_login = NOW() WHERE id = $1`,
        [user.id]
      );
      console.log('Updated last_login timestamp for user:', email);
    } catch (err) {
      console.log('Failed to update last_login but continuing:', err.message);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role || 'user',
        company_id: user.company_id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data without sensitive information
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
      company_id: user.company_id,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || email
    };

    console.log('Login successful (users):', {
      email: userData.email,
      role: userData.role,
      id: userData.id
    });

    return res.status(200).json({
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/session', authenticateToken, async (req, res) => {
  try {
    // First check in contacts table (primary user table now)
    const contacts = await query(
      `SELECT id, email, role, company_id, first_name, last_name, has_system_access
      FROM contacts WHERE id = $1`,
      [req.user.id]
    );

    if (contacts.length > 0 && contacts[0].has_system_access) {
      const user = contacts[0];
      return res.json({ 
        user: {
          id: user.id,
          email: user.email,
          role: user.role || 'user',
          company_id: user.company_id,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
        } 
      });
    }

    // If not found in contacts or doesn't have system access, check users table
    const users = await query(
      'SELECT id, email, role, company_id, first_name, last_name FROM users WHERE id = $1',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        role: user.role || 'user',
        company_id: user.company_id,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
      } 
    });
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ email: req.user.email });
});

app.get('/api/auth/user', async (req, res) => {
  try {
    const { email } = req.query;
    
    const users = await query(`
      SELECT 
        c.id, 
        c.email, 
        c.role, 
        c.company_id,
        co.company_name
      FROM contacts c
      LEFT JOIN companies co ON c.company_id = co.id
      WHERE c.email = $1
    `, [email]);

    const user = users[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API Routes

// Companies
app.get('/api/companies', authenticateToken, async (req, res) => {
  try {
    console.log('GET /api/companies - Fetching companies from database');
    console.log('User:', req.user.email, 'Role:', req.user.role);
    
    let companies;
    
    // Implement RBAC (Role-Based Access Control)
    if (req.user.role === 'admin') {
      // Admins can see all companies
      console.log('Admin user - retrieving all companies');
      companies = await query('SELECT * FROM public.companies ORDER BY name');
      
      // Log sample company for debugging
      if (companies.length > 0) {
        console.log('Sample company data:', companies[0]);
      }
    } else {
      // Regular users can only see their own company
      if (!req.user.company_id) {
        console.log('User has no company_id - no results returned');
        companies = [];
      } else {
        console.log(`Regular user - retrieving only company ${req.user.company_id}`);
        companies = await query('SELECT * FROM public.companies WHERE id = $1', [req.user.company_id]);
      }
    }
    
    console.log('Companies fetched successfully:', companies.length);
    
    // Map all results to ensure company_name is set for front-end compatibility
    companies = companies.map(company => {
      // Create a new object with both name and company_name fields
      const transformedCompany = {
        ...company,
        company_name: company.name || company.company_name || 'Unknown Company'
      };
      
      return transformedCompany;
    });
    
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

app.get('/api/companies/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`GET /api/companies/${id} - Fetching company by ID`);
    
    // Security check - regular users can only access their own company
    if (req.user.role !== 'admin' && req.user.company_id !== id) {
      console.log(`Access denied: User ${req.user.email} (${req.user.role}) attempted to access company ${id} but is associated with company ${req.user.company_id}`);
      return res.status(403).json({ error: 'Access denied: You do not have permission to view this company' });
    }
    
    const company = await query('SELECT * FROM public.companies WHERE id = $1', [id]);
    
    if (company.length === 0) {
      console.log(`Company with ID ${id} not found`);
      return res.status(404).json({ error: 'Company not found' });
    }
    
    console.log(`Company found:`, company[0]);
    
    // Ensure all fields are properly returned
    const companyData = {
      ...company[0],
      // Set company_name for front-end compatibility 
      company_name: company[0].name
    };
    
    console.log(`Returning company data:`, companyData);
    res.json(companyData);
  } catch (error) {
    console.error(`Error getting company ${id}:`, error);
    res.status(500).json({ error: 'Failed to get company', details: error.message });
  }
});

app.post('/api/companies', authenticateToken, async (req, res) => {
  try {
    console.log('POST /api/companies - Creating new company');
    console.log('Request body:', req.body);
    
    // Check if we're getting company_name instead of name
    let { 
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
    } = req.body;
    
    // Use company_name as name if name is not provided
    if (!name && company_name) {
      name = company_name;
      console.log('Using company_name as name:', name);
    }
    
    if (!name) {
      console.error('Company name is required but not provided');
      return res.status(400).json({ error: 'Company name is required' });
    }
    
    // Check if the companies table exists and get its columns
    try {
      const tableInfo = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies'
      `);
      console.log('Companies table columns:', tableInfo.rows.map(row => row.column_name));
    } catch (error) {
      console.error('Error getting table info:', error);
    }
    
    console.log('Executing INSERT query for new company with name:', name);
    const result = await query(
      `INSERT INTO public.companies (
        name,
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
        created_at, 
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *`,
      [
        name,
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
      ]
    );
    
    // Ensure all fields are properly returned
    const newCompany = {
      ...result[0],
      // Add company_name for front-end compatibility
      company_name: result[0].name
    };
    
    console.log('Company created successfully:', newCompany);
    res.status(201).json(newCompany);
  } catch (error) {
    console.error('Failed to create company:', error);
    res.status(500).json({ error: 'Failed to create company', details: error.message });
  }
});

app.put('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`PUT /api/companies/${id} - Updating company`);
    console.log('Request body:', req.body);
    
    const { 
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
    } = req.body;
    
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    // Handle both name and company_name fields
    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    
    // If company_name is provided but name isn't, use it for the name field
    if (company_name !== undefined && name === undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(company_name);
    }
    
    if (address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      values.push(address);
    }
    
    if (city !== undefined) {
      updates.push(`city = $${paramIndex++}`);
      values.push(city);
    }
    
    if (county !== undefined) {
      updates.push(`county = $${paramIndex++}`);
      values.push(county);
    }
    
    if (postcode !== undefined) {
      updates.push(`postcode = $${paramIndex++}`);
      values.push(postcode);
    }
    
    if (country !== undefined) {
      updates.push(`country = $${paramIndex++}`);
      values.push(country);
    }
    
    if (telephone !== undefined) {
      updates.push(`telephone = $${paramIndex++}`);
      values.push(telephone);
    }
    
    if (industry !== undefined) {
      updates.push(`industry = $${paramIndex++}`);
      values.push(industry);
    }
    
    if (website !== undefined) {
      updates.push(`website = $${paramIndex++}`);
      values.push(website);
    }
    
    if (contact_name !== undefined) {
      updates.push(`contact_name = $${paramIndex++}`);
      values.push(contact_name);
    }
    
    if (contact_email !== undefined) {
      updates.push(`contact_email = $${paramIndex++}`);
      values.push(contact_email);
    }
    
    if (contact_phone !== undefined) {
      updates.push(`contact_phone = $${paramIndex++}`);
      values.push(contact_phone);
    }
    
    updates.push('updated_at = NOW()');
    values.push(id);
    
    console.log('Executing UPDATE query with values:', values);
    const result = await query(
      `UPDATE public.companies
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );
    
    if (result.length === 0) {
      console.log(`Company with ID ${id} not found`);
      return res.status(404).json({ error: 'Company not found' });
    }
    
    // Ensure all fields are properly returned
    const updatedCompany = {
      ...result[0],
      // Add company_name for front-end compatibility
      company_name: result[0].name
    };
    
    console.log('Company updated successfully:', updatedCompany);
    res.json(updatedCompany);
  } catch (error) {
    console.error('Failed to update company:', error);
    res.status(500).json({ error: 'Failed to update company', details: error.message });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM public.companies WHERE id = $1 RETURNING id', [id]);
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(`Error deleting company ${id}:`, error);
    res.status(500).json({ error: 'Failed to delete company', details: error.message });
  }
});

// Contact Routes
app.get('/api/contacts', authenticateToken, async (req, res) => {
  try {
    const { company_id } = req.query;
    let queryText = 'SELECT * FROM contacts';
    const queryParams = [];

    if (company_id) {
      queryText += ' WHERE company_id = $1';
      queryParams.push(company_id);
    }

    queryText += ' ORDER BY is_primary DESC, first_name ASC, last_name ASC';
    
    const contacts = await query(queryText, queryParams);
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Add new endpoint for company contacts
app.get('/api/companies/:id/contacts', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const contacts = await query(
      `SELECT * FROM contacts 
       WHERE company_id = $1 
       ORDER BY is_primary DESC, first_name ASC, last_name ASC`,
      [id]
    );
    
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching company contacts:', error);
    res.status(500).json({ error: 'Failed to fetch company contacts' });
  }
});

app.post('/api/contacts', authenticateToken, async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      telephone,
      mobile,
      job_title,
      is_primary,
      has_system_access,
      role,
      company_id,
      password
    } = req.body;

    console.log('Creating new contact:', {
      first_name,
      last_name,
      email,
      has_system_access,
      role,
      company_id
    });

    // Validate required fields
    if (!first_name || !last_name || !company_id) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'First name, last name, and company ID are required' });
    }

    // If system access is requested, validate email and role
    if (has_system_access) {
      console.log('Contact requires system access, checking email uniqueness');
      if (!email) {
        console.log('Email required but not provided');
        return res.status(400).json({ error: 'Email is required for contacts with system access' });
      }

      // Check for existing contact with this email, regardless of system access
      const existingContact = await query(
        'SELECT id, email, has_system_access FROM contacts WHERE email = $1',
        [email]
      );
      
      console.log('Existing contact check result:', existingContact);
      
      if (existingContact.length > 0) {
        console.log('Found existing contact:', existingContact[0]);
        return res.status(400).json({ error: 'A contact with this email already exists' });
      }

      // Validate role
      if (!role || !['admin', 'user'].includes(role)) {
        console.log('Invalid role provided:', role);
        return res.status(400).json({ error: 'Valid role (admin or user) is required for contacts with system access' });
      }
    }

    // If this is a primary contact, unset any existing primary contacts
    if (is_primary) {
      await query(
        'UPDATE contacts SET is_primary = false WHERE company_id = $1',
        [company_id]
      );
    }

    // Only generate password hash if system access is required
    let passwordHash = null;
    let generatedPassword = null;
    if (has_system_access) {
      if (!password) {
        // Generate a secure password
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        generatedPassword = Array(12).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
      } else {
        generatedPassword = password;
      }
      passwordHash = await bcrypt.hash(generatedPassword, 10);
      console.log('Generated password hash for system access user');
    }

    // Create the contact
    const newContact = await query(
      `INSERT INTO contacts (
        first_name, last_name, email, telephone, mobile, job_title, 
        is_primary, has_system_access, role, company_id, password_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        first_name, 
        last_name, 
        email, 
        telephone || null, 
        mobile || null, 
        job_title || null, 
        is_primary || false, 
        has_system_access || false,
        has_system_access ? (role || 'user') : null,
        company_id,
        passwordHash
      ]
    );

    console.log('Contact created successfully:', {
      id: newContact[0].id,
      email: newContact[0].email,
      has_system_access: newContact[0].has_system_access,
      role: newContact[0].role
    });

    // Only return the password if the contact has system access
    const response = {
      ...newContact[0],
      ...(has_system_access ? { generated_password: generatedPassword } : {})
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating contact:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'A contact with this email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create contact', details: error.message });
    }
  }
});

app.delete('/api/contacts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedContact = await query(
      'DELETE FROM contacts WHERE id = $1 RETURNING *',
      [id]
    );

    if (deletedContact.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(deletedContact[0]);
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

app.put('/api/contacts/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    email,
    telephone,
    mobile,
    job_title,
    has_system_access,
    role,
    company_id
  } = req.body;

  try {
    // Check if email exists for system access users
    if (has_system_access && email) {
      const existingContact = await query(
        'SELECT id, email, has_system_access FROM contacts WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (existingContact.length > 0 && existingContact[0].has_system_access) {
        return res.status(400).json({
          error: 'A contact with this email already exists and has system access'
        });
      }
    }

    const result = await query(
      `UPDATE contacts 
       SET first_name = $1,
           last_name = $2,
           email = $3,
           telephone = $4,
           mobile = $5,
           job_title = $6,
           has_system_access = $7,
           role = $8,
           company_id = $9,
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [first_name, last_name, email, telephone, mobile, job_title, has_system_access, role, company_id, id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Auth Routes for user registration
app.post('/api/auth/register', authenticateToken, async (req, res) => {
  try {
    const { email, password, role, name, company_id } = req.body;

    // Validate required fields
    if (!email || !password || !company_id) {
      return res.status(400).json({ error: 'Email, password, and company ID are required' });
    }

    // Check if user exists
    const existingUsers = await query(
      'SELECT * FROM contacts WHERE email = $1 AND has_system_access = true',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the contact with system access
    const updatedContact = await query(
      `UPDATE contacts 
       SET has_system_access = true, 
           password_hash = $1,
           role = $2
       WHERE email = $3 AND company_id = $4
       RETURNING id, email, role, company_id`,
      [hashedPassword, role || 'user', email, company_id]
    );

    if (updatedContact.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.status(201).json(updatedContact[0]);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Database schema management
app.post('/api/db/add-contact-fields', async (req, res) => {
  try {
    console.log('POST /api/db/add-contact-fields - Adding contact fields to companies table');
    
    // Check if the columns already exist
    const columnsCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'companies'
      AND column_name IN ('contact_name', 'contact_email', 'contact_phone', 'industry', 'website', 'company_name')
    `);
    
    const existingColumns = columnsCheck.rows.map(row => row.column_name);
    console.log('Existing columns:', existingColumns);
    
    // Add missing columns
    const columnsToAdd = [];
    
    if (!existingColumns.includes('contact_name')) {
      columnsToAdd.push('contact_name TEXT');
    }
    
    if (!existingColumns.includes('contact_email')) {
      columnsToAdd.push('contact_email TEXT');
    }
    
    if (!existingColumns.includes('contact_phone')) {
      columnsToAdd.push('contact_phone TEXT');
    }
    
    if (!existingColumns.includes('industry')) {
      columnsToAdd.push('industry TEXT');
    }
    
    if (!existingColumns.includes('website')) {
      columnsToAdd.push('website TEXT');
    }
    
    if (!existingColumns.includes('company_name')) {
      columnsToAdd.push('company_name TEXT');
    }
    
    if (columnsToAdd.length > 0) {
      console.log('Adding missing columns:', columnsToAdd);
      
      for (const column of columnsToAdd) {
        const [columnName, columnType] = column.split(' ');
        await pool.query(`
          ALTER TABLE public.companies
          ADD COLUMN IF NOT EXISTS ${columnName} ${columnType}
        `);
        console.log(`Added column: ${columnName}`);
      }
      
      // Copy values from name to company_name if needed
      if (columnsToAdd.some(col => col.startsWith('company_name'))) {
        console.log('Copying values from name to company_name...');
        await pool.query(`
          UPDATE public.companies
          SET company_name = name
          WHERE company_name IS NULL
        `);
        console.log('Values copied from name to company_name');
      }
      
      res.json({ success: true, message: 'Contact fields added successfully', added: columnsToAdd });
    } else {
      console.log('All required columns already exist');
      res.json({ success: true, message: 'All required columns already exist' });
    }
  } catch (error) {
    console.error('Failed to add contact fields:', error);
    res.status(500).json({ error: 'Failed to add contact fields', details: error.message });
  }
});

// Temporary diagnostic endpoint to check users
app.get('/api/check-admin', async (req, res) => {
  try {
    // Check contacts table
    const contacts = await query(
      `SELECT id, email, role, has_system_access, first_name, last_name, created_at 
       FROM contacts 
       WHERE email = $1`,
      ['paul@basicwelding.co.uk']
    );
    
    // Check users table
    const users = await query(
      `SELECT id, email, role, first_name, last_name, created_at 
       FROM users 
       WHERE email = $1`,
      ['paul@basicwelding.co.uk']
    );
    
    res.json({
      inContacts: contacts.length > 0 ? contacts[0] : null,
      inUsers: users.length > 0 ? users[0] : null,
      message: 'Admin user check complete'
    });
  } catch (error) {
    console.error('Error checking admin user:', error);
    res.status(500).json({ error: 'Server error checking admin user' });
  }
});

// Endpoint to create admin user if it doesn't exist
app.get('/api/create-admin', async (req, res) => {
  try {
    // Check if admin already exists in contacts
    const adminExists = await query(
      `SELECT COUNT(*) FROM contacts WHERE email = $1`,
      ['paul@basicwelding.co.uk']
    );
    
    if (parseInt(adminExists[0].count) > 0) {
      return res.json({ message: 'Admin user already exists in contacts' });
    }
    
    // Generate password hash
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Create admin user in contacts table with company_id as NULL
    const result = await query(
      `INSERT INTO contacts 
       (id, email, password_hash, first_name, last_name, role, has_system_access, created_at, updated_at) 
       VALUES 
       ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id, email, role`,
      [
        require('uuid').v4(),
        'paul@basicwelding.co.uk',
        passwordHash,
        'Paul',
        'Jones',
        'admin',
        true
      ]
    );
    
    res.json({
      message: 'Admin user created successfully',
      user: result[0]
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ error: 'Server error creating admin user', details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});