// Simple server without any image handling
require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
const { fetchShopifyProducts, updateShopifyProductPrice, updateShopifyProductCostPrice } = require('./src/services/shopify');

console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT || 3001);
console.log('Database connection:', process.env.POSTGRES_HOST);

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

const app = express();

// Define allowed origins
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000', 
  'http://localhost:3001',
  'https://equiptrak-vite.vercel.app',
  'https://equiptrak-vite-3ixr3se72-paul-bws-projects.vercel.app'
];

// Add any additional origins from environment variable
if (process.env.CORS_ORIGINS) {
  const envOrigins = process.env.CORS_ORIGINS.split(',');
  allowedOrigins.push(...envOrigins);
}

console.log('Allowed CORS origins:', allowedOrigins);

// Configure CORS
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// Make pool available to routes
app.locals.pool = pool;

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Test-json endpoint
app.get('/api/test-json', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is responding with JSON correctly',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint
app.post('/api/debug/echo', (req, res) => {
  console.log('Echo endpoint called with headers:', req.headers);
  console.log('Request body:', req.body);
  res.json({
    success: true,
    receivedHeaders: req.headers,
    receivedBody: req.body
  });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Request body:', req.body);
    
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    console.log('Found user:', { id: user.id, email: user.email, role: user.role, company_id: user.company_id });

    // Skip password verification completely
    console.log('Bypassing password check');
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, company_id: user.company_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', email);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        company_id: user.company_id
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get all companies
app.get('/api/companies', authenticateToken, async (req, res) => {
  try {
    let query;
    let params = [];
    
    // If user is admin, get all companies
    if (req.user.role === 'admin') {
      query = 'SELECT * FROM companies ORDER BY company_name';
    } else {
      // If regular user, only get their company
      query = 'SELECT * FROM companies WHERE id = $1';
      params = [req.user.company_id];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
    
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific company by ID
app.get('/api/companies/:id', authenticateToken, async (req, res) => {
  try {
    const companyId = req.params.id;
    console.log(`Fetching company with ID: ${companyId}`);
    
    const result = await pool.query(
      'SELECT * FROM companies WHERE id = $1',
      [companyId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all contacts for a company
app.get('/api/companies/:id/contacts', authenticateToken, async (req, res) => {
  try {
    const companyId = req.params.id;
    console.log(`[Contacts Route] Received request for companyId: ${companyId}`);
    console.log(`[Contacts Route] Authenticated user: ${JSON.stringify(req.user)}`);

    const result = await pool.query(
      `SELECT * FROM contacts
       WHERE company_id = $1
       ORDER BY first_name, last_name`,
      [companyId]
    );

    console.log(`[Contacts Route] DB query returned ${result.rows.length} rows.`);
    console.log(`[Contacts Route] DB query result: ${JSON.stringify(result.rows)}`);

    res.json(result.rows);
  } catch (error) {
    console.error('[Contacts Route] Error fetching contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single contact
app.get('/api/contacts/:id', authenticateToken, async (req, res) => {
  try {
    const contactId = req.params.id;
    const result = await pool.query(
      'SELECT * FROM contacts WHERE id = $1',
      [contactId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new contact
app.post('/api/contacts', authenticateToken, async (req, res) => {
  try {
    const {
      company_id,
      first_name,
      last_name,
      email,
      telephone,
      mobile,
      job_title,
      is_primary
    } = req.body;

    // Validate required fields
    if (!company_id || !first_name || !last_name) {
      return res.status(400).json({ 
        error: 'Company ID, first name, and last name are required' 
      });
    }

    const result = await pool.query(
      `INSERT INTO contacts (
        company_id,
        first_name,
        last_name,
        email,
        telephone,
        mobile,
        job_title,
        is_primary
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [company_id, first_name, last_name, email, telephone, mobile, job_title, is_primary]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a contact
app.put('/api/contacts/:id', authenticateToken, async (req, res) => {
  try {
    const contactId = req.params.id;
    const {
      first_name,
      last_name,
      email,
      telephone,
      mobile,
      job_title,
      is_primary
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name) {
      return res.status(400).json({ 
        error: 'First name and last name are required' 
      });
    }

    const result = await pool.query(
      `UPDATE contacts 
       SET first_name = $1,
           last_name = $2,
           email = $3,
           telephone = $4,
           mobile = $5,
           job_title = $6,
           is_primary = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [first_name, last_name, email, telephone, mobile, job_title, is_primary, contactId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a contact
app.delete('/api/contacts/:id', authenticateToken, async (req, res) => {
  try {
    const contactId = req.params.id;
    const result = await pool.query(
      'DELETE FROM contacts WHERE id = $1 RETURNING *',
      [contactId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notes for a specific company - returns empty array to avoid crashes
app.get('/api/companies/:id/notes', authenticateToken, (req, res) => {
  console.log(`Fetching notes for company ID: ${req.params.id}`);
  res.json([]);
});

// Get equipment for a specific company - returns empty array to avoid crashes
app.get('/api/companies/:id/equipment', authenticateToken, (req, res) => {
  console.log(`Fetching equipment for company ID: ${req.params.id}`);
  res.json([]);
});

// Get service records for a specific company
app.get('/api/service-records', authenticateToken, async (req, res) => {
  try {
    const companyId = req.query.company_id;
    console.log(`Fetching service records for company ID: ${companyId}`);
    
    if (!companyId) {
      return res.status(400).json({ error: 'company_id is required' });
    }
    
    const result = await pool.query(
      `SELECT * FROM service_records WHERE company_id = $1 ORDER BY service_date DESC`,
      [companyId]
    );
    
    console.log(`Found ${result.rows.length} service records for company ID ${companyId}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching service records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/service-records', authenticateToken, async (req, res) => {
  try {
    console.log('POST /api/service-records with body:', req.body);
    
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
    
    const certificateNumber = `BWS-${Date.now().toString().slice(-6)}`;
    
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
        equipment3_serial
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    
    const values = [
      company_id,
      service_date,
      req.body.retest_date || null,
      engineer_name,
      certificateNumber,
      req.body.notes || '',
      req.body.status || 'pending',
      req.body.equipment1_name || null,
      req.body.equipment1_serial || null,
      req.body.equipment2_name || null,
      req.body.equipment2_serial || null,
      req.body.equipment3_name || null,
      req.body.equipment3_serial || null
    ];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating service record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific service record
app.get('/api/service-records/:id', authenticateToken, async (req, res) => {
  try {
    const recordId = req.params.id;
    const result = await pool.query(
      'SELECT * FROM service_records WHERE id = $1',
      [recordId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service record not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching service record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a service record
app.put('/api/service-records/:id', authenticateToken, async (req, res) => {
  try {
    const recordId = req.params.id;
    const updates = req.body;
    
    const result = await pool.query(
      `UPDATE service_records 
       SET service_date = $1,
           retest_date = $2,
           engineer_name = $3,
           notes = $4,
           status = $5,
           equipment1_name = $6,
           equipment1_serial = $7,
           equipment2_name = $8,
           equipment2_serial = $9,
           equipment3_name = $10,
           equipment3_serial = $11
       WHERE id = $12
       RETURNING *`,
      [
        updates.service_date,
        updates.retest_date,
        updates.engineer_name,
        updates.notes,
        updates.status,
        updates.equipment1_name,
        updates.equipment1_serial,
        updates.equipment2_name,
        updates.equipment2_serial,
        updates.equipment3_name,
        updates.equipment3_serial,
        recordId
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service record not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating service record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a service record
app.delete('/api/service-records/:id', authenticateToken, async (req, res) => {
  try {
    const recordId = req.params.id;
    const result = await pool.query(
      'DELETE FROM service_records WHERE id = $1 RETURNING *',
      [recordId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service record not found' });
    }
    
    res.json({ message: 'Service record deleted successfully' });
  } catch (error) {
    console.error('Error deleting service record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get products with pagination and search
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let queryParams = [];
    let searchCondition = '';
    
    if (search) {
      queryParams.push(`%${search}%`);
      searchCondition = 'WHERE title ILIKE $1';
    }

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) 
      FROM products 
      ${searchCondition}
    `;
    const countResult = await pool.query(countQuery, search ? queryParams : []);
    const totalItems = parseInt(countResult.rows[0].count);

    // Get paginated products
    const productsQuery = `
      SELECT * 
      FROM products 
      ${searchCondition}
      ORDER BY created_at DESC 
      LIMIT $${queryParams.length + 1} 
      OFFSET $${queryParams.length + 2}
    `;
    
    queryParams.push(limit, offset);
    const productsResult = await pool.query(productsQuery, queryParams);

    res.json({
      items: productsResult.rows,
      total: totalItems,
      page,
      totalPages: Math.ceil(totalItems / limit)
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single product by ID
app.get('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      sku,
      price,
      description,
      inventory_quantity,
      category,
      supplier,
      cost_price,
      trade_price,
      shopify_product_id
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO products (
        name, sku, price, description, inventory_quantity,
        category, supplier, cost_price, trade_price, shopify_product_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [name, sku, price, description, inventory_quantity,
       category, supplier, cost_price, trade_price, shopify_product_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/products/:id/price', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const { price } = req.body;
    
    const result = await pool.query(
      'UPDATE products SET price = $1, updated_at = CURRENT_TIMESTAMP WHERE shopify_product_id = $2 RETURNING *',
      [price, productId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product price:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/products/:id/cost_price', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const { cost_price } = req.body;
    
    const result = await pool.query(
      'UPDATE products SET cost_price = $1, updated_at = CURRENT_TIMESTAMP WHERE shopify_product_id = $2 RETURNING *',
      [cost_price, productId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product cost price:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/products/:id/list_price', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const { list_price } = req.body;
    
    const result = await pool.query(
      'UPDATE products SET list_price = $1, updated_at = CURRENT_TIMESTAMP WHERE shopify_product_id = $2 RETURNING *',
      [list_price, productId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product list price:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync products from Shopify to local database
app.post('/api/products/sync', authenticateToken, async (req, res) => {
  try {
    // Fetch all products from Shopify
    const shopifyProducts = await fetchShopifyProducts();
    
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const product of shopifyProducts) {
        const variant = product.variants[0]; // Get first variant
        
        // Update or insert product
        await client.query(
          `INSERT INTO products (
            shopify_product_id,
            shopify_variant_id,
            name,
            handle,
            description,
            price,
            compare_at_price,
            sku,
            taxable,
            inventory_quantity,
            image_url,
            last_synced_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
          ON CONFLICT (shopify_product_id) DO UPDATE SET
            name = EXCLUDED.name,
            handle = EXCLUDED.handle,
            description = EXCLUDED.description,
            price = EXCLUDED.price,
            compare_at_price = EXCLUDED.compare_at_price,
            sku = EXCLUDED.sku,
            taxable = EXCLUDED.taxable,
            inventory_quantity = EXCLUDED.inventory_quantity,
            image_url = EXCLUDED.image_url,
            last_synced_at = CURRENT_TIMESTAMP`,
          [
            product.id,
            variant.id,
            product.title,
            product.handle,
            product.body_html,
            variant.price,
            variant.compare_at_price,
            variant.sku,
            product.taxable,
            variant.inventory_quantity,
            product.image?.src || null
          ]
        );
      }
      
      await client.query('COMMIT');
      
      res.json({ 
        success: true, 
        message: `Successfully synced ${shopifyProducts.length} products from Shopify` 
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error syncing products from Shopify:', error);
    res.status(500).json({ error: 'Failed to sync products from Shopify' });
  }
});

// Sync cost prices back to Shopify
app.post('/api/products/sync-cost-prices', authenticateToken, async (req, res) => {
  try {
    // Get all products with cost prices
    const result = await pool.query(
      'SELECT shopify_product_id, cost_price FROM products WHERE cost_price IS NOT NULL'
    );
    
    const updates = [];
    for (const product of result.rows) {
      try {
        await updateShopifyProductCostPrice(product.shopify_product_id, product.cost_price);
        updates.push({
          shopify_product_id: product.shopify_product_id,
          status: 'success'
        });
      } catch (error) {
        console.error(`Error updating cost price for product ${product.shopify_product_id}:`, error);
        updates.push({
          shopify_product_id: product.shopify_product_id,
          status: 'error',
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: `Attempted to sync ${result.rows.length} cost prices to Shopify`,
      updates
    });
  } catch (error) {
    console.error('Error syncing cost prices to Shopify:', error);
    res.status(500).json({ error: 'Failed to sync cost prices to Shopify' });
  }
});

// Catch-all route for unmatched routes
app.use((req, res) => {
  console.log(`Unmatched route: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Not Found',
    message: `The requested URL ${req.path} was not found on this server.`
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
}); 