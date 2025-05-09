const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Debug middleware for this router
router.use((req, res, next) => {
  console.log(`[Companies Route] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Get all companies
router.get('/', authenticateToken, async (req, res) => {
  console.log('GET /api/companies request received');
  try {
    const result = await pool.query('SELECT * FROM companies ORDER BY company_name');
    console.log(`Found ${result.rows.length} companies`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching companies:', err);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Get a single company by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  console.log(`[Companies Route] GET single company request:`, {
    id: id,
    url: req.url,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl
  });
  
  try {
    console.log('Executing query with ID:', id);
    const result = await pool.query(
      `SELECT c.*, 
        i.file_path as logo_url 
       FROM companies c 
       LEFT JOIN images i ON i.entity_id = c.id 
       AND i.entity_type = 'company_logo'
       WHERE c.id = $1::uuid`,
      [id]
    );
    console.log('Query result:', result.rows);

    if (result.rows.length === 0) {
      console.log(`No company found with ID: ${id}`);
      return res.status(404).json({ 
        error: 'Company not found',
        requestedId: id
      });
    }
    
    console.log('Company found:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching company:', {
      error: err.message,
      id: id,
      stack: err.stack
    });
    res.status(500).json({ 
      error: 'Failed to fetch company',
      details: err.message
    });
  }
});

// Add a new company
router.post('/', authenticateToken, async (req, res) => {
  const { company_name, address, city, postcode, telephone, email, status } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO companies (company_name, address, city, postcode, telephone, email, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [company_name, address, city, postcode, telephone, email, status || 'Active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding company:', err);
    res.status(500).json({ error: 'Failed to add company' });
  }
});

module.exports = router; 