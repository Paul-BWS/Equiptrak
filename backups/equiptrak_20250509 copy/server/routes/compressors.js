const express = require('express');
const router = express.Router();

// Get the authentication middleware and pool from the parent module
let authenticateToken;
let pool;

// This function is called when the route is registered in index.js
// It allows us to pass in dependencies from the main app
function init(app) {
  if (!app || !app.locals) {
    console.error('App object or app.locals not provided to compressors route init');
    return router;
  }
  
  authenticateToken = app.locals.authenticateToken;
  pool = app.locals.pool;
  
  if (!authenticateToken) {
    console.error('authenticateToken middleware not found in app.locals');
  }
  
  if (!pool) {
    console.error('database pool not found in app.locals');
  }
  
  console.log('Compressors routes initialized with required dependencies');
  return router;
}

// Helper function to determine which table to use
async function getCompressorTableName(pool) {
  try {
    const checkTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('compressor_records', 'compressors_records');
    `);
    
    // If neither table exists
    if (checkTables.rows.length === 0) {
      return null;
    }
    
    // Determine which table to use - prefer compressors_records if both exist
    if (checkTables.rows.length === 1) {
      return checkTables.rows[0].table_name;
    } else if (checkTables.rows.length > 1) {
      // If both exist, find compressors_records
      const foundPlural = checkTables.rows.find(row => row.table_name === 'compressors_records');
      if (foundPlural) {
        return 'compressors_records';
      } else {
        return 'compressor_records';
      }
    }
    
    // Fallback to plural version
    return 'compressors_records';
  } catch (error) {
    console.error('Error finding compressor table:', error);
    return null;
  }
}

// Get compressor records for a company
// GET /api/compressors
router.get('/', (req, res, next) => {
  if (!authenticateToken) {
    return res.status(500).json({ error: 'Authentication middleware not initialized' });
  }
  authenticateToken(req, res, () => {
    handleGetCompressors(req, res);
  });
});

async function handleGetCompressors(req, res) {
  const { company_id } = req.query;

  if (!company_id) {
    return res.status(400).json({ error: 'Company ID is required' });
  }

  // Security check: Ensure user can access this company's data
  if (req.user.role !== 'admin' && req.user.company_id !== company_id) {
    return res.status(403).json({ error: 'Forbidden: Access denied' });
  }

  try {
    // Get the right table name
    const tableName = await getCompressorTableName(pool);
    
    // If no table exists
    if (!tableName) {
      console.log('No compressor table found in database');
      return res.status(200).json([]); // Return empty array
    }
    
    console.log(`Using table: ${tableName}`);
    
    // Query using the determined table name
    const result = await pool.query(
      `SELECT * FROM ${tableName} WHERE company_id = $1 ORDER BY service_date DESC`,
      [company_id]
    );
    console.log(`Found ${result.rows.length} compressor records for company ID ${company_id}`);
    
    // Always return the rows array (even if empty)
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching compressor records:', error);
    
    // Handle specific errors
    if (error.code === '42P01') { // PostgreSQL error code for undefined table
      console.error('Table for compressor records likely does not exist.');
      // Return empty array instead of error for missing table
      return res.status(200).json([]);
    }
    
    // For any other errors, return a 500
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get a specific compressor record
// GET /api/compressors/:id
router.get('/:id', (req, res, next) => {
  if (!authenticateToken) {
    return res.status(500).json({ error: 'Authentication middleware not initialized' });
  }
  authenticateToken(req, res, () => {
    handleGetCompressorById(req, res);
  });
});

async function handleGetCompressorById(req, res) {
  const { id } = req.params;

  try {
    // Get the right table name
    const tableName = await getCompressorTableName(pool);
    
    // If no table exists
    if (!tableName) {
      return res.status(404).json({ error: 'Compressor records table not found' });
    }
    
    const result = await pool.query(
      `SELECT * FROM ${tableName} WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Compressor record not found' });
    }

    const record = result.rows[0];

    // Security check: Ensure user can access this record
    if (req.user.role !== 'admin' && req.user.company_id !== record.company_id) {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }

    res.json(record);
  } catch (error) {
    console.error('Error fetching compressor record:', error);
    if (error.code === '42P01') {
      console.error('Table for compressor records likely does not exist.');
      return res.status(404).json({ error: 'Compressor records table not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Create a new compressor record
// POST /api/compressors
router.post('/', (req, res, next) => {
  if (!authenticateToken) {
    return res.status(500).json({ error: 'Authentication middleware not initialized' });
  }
  authenticateToken(req, res, () => {
    handleCreateCompressor(req, res);
  });
});

async function handleCreateCompressor(req, res) {
  console.log('Create compressor request received:', req.body);
  
  const { company_id, ...recordData } = req.body;

  if (!company_id) {
    console.log('Error: Company ID is required');
    return res.status(400).json({ error: 'Company ID is required' });
  }

  // Security check: Ensure user can create records for this company
  if (req.user.role !== 'admin' && req.user.company_id !== company_id) {
    console.log('Security check failed:', { 
      userRole: req.user.role, 
      userCompanyId: req.user.company_id, 
      requestedCompanyId: company_id 
    });
    return res.status(403).json({ error: 'Forbidden: Access denied' });
  }

  try {
    // Get the right table name
    const tableName = await getCompressorTableName(pool);
    console.log('Using table:', tableName);
    
    // If no table exists
    if (!tableName) {
      console.log('Error: Compressor records table not found');
      return res.status(500).json({ error: 'Compressor records table not found. Please contact an administrator.' });
    }

    // Define standard and potential columns (adapt based on your actual table)
    const standardCols = ['company_id', 'equipment_name', 'equipment_serial', 'service_date', 'certificate_number', 'status'];
    // Add compressor-specific columns
    const compressorSpecificCols = [
      'notes',
      'certificate_url',
      'safety_valve_test_result',
      'oil_level_check_result',
      'pressure_test_result',
      'filter_check_result',
      'retest_date'
    ];
    const allowedCols = [...standardCols, ...compressorSpecificCols]; 

    const cols = ['company_id'];
    const values = [company_id];
    const placeholders = ['$1'];
    let placeholderIndex = 2;

    // Log the recordData we're processing
    console.log('Record data to process:', recordData);
    console.log('Allowed columns:', allowedCols);

    for (const col of allowedCols) {
      if (col !== 'company_id' && recordData[col] !== undefined) {
        cols.push(col);
        
        // Handle boolean conversion for test results
        let value = recordData[col];
        
        // Special handling for boolean fields
        if (['safety_valve_test_result', 'oil_level_check_result', 'pressure_test_result', 'filter_check_result'].includes(col)) {
          // If it's a string like "PASS", "FAIL" or "NA", convert appropriately
          if (typeof value === 'string') {
            if (value === 'PASS') value = true;
            else if (value === 'FAIL') value = false;
            else if (value === 'NA') value = null;
          }
          console.log(`Converted ${col} from ${recordData[col]} to ${value}`);
        }
        
        values.push(value);
        placeholders.push(`$${placeholderIndex++}`);
        console.log(`Added column ${col} with value:`, value);
      }
    }

    // Add created_at and updated_at
    cols.push('created_at', 'updated_at');
    placeholders.push('CURRENT_TIMESTAMP', 'CURRENT_TIMESTAMP');

    const queryText = `
      INSERT INTO ${tableName} (${cols.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    console.log('SQL Query:', queryText);
    console.log('Query values:', values);

    const result = await pool.query(queryText, values);
    console.log('Query successful, returning row:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating compressor record:', error);
    if (error.code === '42P01') {
      console.error('Table for compressor records likely does not exist.');
      return res.status(500).json({ error: 'Compressor records table not found. Please contact an administrator.' });
    }
    // Handle other potential errors like missing required fields if not covered above
    console.error('Detailed error:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}

// Update a compressor record
// PUT /api/compressors/:id
router.put('/:id', (req, res, next) => {
  if (!authenticateToken) {
    return res.status(500).json({ error: 'Authentication middleware not initialized' });
  }
  authenticateToken(req, res, () => {
    handleUpdateCompressor(req, res);
  });
});

async function handleUpdateCompressor(req, res) {
  const { id } = req.params;
  const { company_id, ...recordData } = req.body; // Exclude company_id from direct update

  try {
    // Get the right table name
    const tableName = await getCompressorTableName(pool);
    
    // If no table exists
    if (!tableName) {
      return res.status(500).json({ error: 'Compressor records table not found. Please contact an administrator.' });
    }
    
    // First, fetch the existing record to check ownership
    const checkResult = await pool.query(
      `SELECT company_id FROM ${tableName} WHERE id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Compressor record not found' });
    }

    const existingRecordCompanyId = checkResult.rows[0].company_id;

    // Security check: Ensure user can update this record
    if (req.user.role !== 'admin' && req.user.company_id !== existingRecordCompanyId) {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }

    // Define updateable columns (exclude id, company_id, created_at)
    const standardCols = ['equipment_name', 'equipment_serial', 'service_date', 'certificate_number', 'status'];
    // Add compressor-specific columns
    const compressorSpecificCols = [
      'notes',
      'certificate_url',
      'safety_valve_test_result',
      'oil_level_check_result',
      'pressure_test_result',
      'filter_check_result',
      'retest_date'
    ];
    const allowedCols = [...standardCols, ...compressorSpecificCols];

    const setClauses = [];
    const values = [];
    let placeholderIndex = 1;

    for (const col of allowedCols) {
      if (recordData[col] !== undefined) {
        setClauses.push(`${col} = $${placeholderIndex++}`);
        
        // Handle boolean conversion for test results
        let value = recordData[col];
        
        // Special handling for boolean fields
        if (['safety_valve_test_result', 'oil_level_check_result', 'pressure_test_result', 'filter_check_result'].includes(col)) {
          // If it's a string like "PASS", "FAIL" or "NA", convert appropriately
          if (typeof value === 'string') {
            if (value === 'PASS') value = true;
            else if (value === 'FAIL') value = false;
            else if (value === 'NA') value = null;
          }
          console.log(`Converted ${col} from ${recordData[col]} to ${value}`);
        }
        
        values.push(value);
      }
    }

    // Add updated_at
    setClauses.push('updated_at = CURRENT_TIMESTAMP');

    if (setClauses.length === 1) { // Only updated_at clause
      return res.status(400).json({ error: 'No updatable fields provided' });
    }

    values.push(id); // Add id for the WHERE clause

    const queryText = `
      UPDATE ${tableName}
      SET ${setClauses.join(', ')}
      WHERE id = $${placeholderIndex}
      RETURNING *
    `;

    const result = await pool.query(queryText, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating compressor record:', error);
    if (error.code === '42P01') {
      console.error('Table for compressor records likely does not exist.');
      return res.status(500).json({ error: 'Compressor records table not found. Please contact an administrator.' });
    }
    // Handle other potential errors
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Delete a compressor record
// DELETE /api/compressors/:id
router.delete('/:id', (req, res, next) => {
  if (!authenticateToken) {
    return res.status(500).json({ error: 'Authentication middleware not initialized' });
  }
  authenticateToken(req, res, () => {
    handleDeleteCompressor(req, res);
  });
});

async function handleDeleteCompressor(req, res) {
  const { id } = req.params;

  try {
    // Get the right table name
    const tableName = await getCompressorTableName(pool);
    
    // If no table exists
    if (!tableName) {
      return res.status(500).json({ error: 'Compressor records table not found. Please contact an administrator.' });
    }
    
    // First, fetch the existing record to check ownership
    const checkResult = await pool.query(
      `SELECT company_id FROM ${tableName} WHERE id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      // Record already deleted or never existed, treat as success (idempotent)
      return res.status(204).send();
    }

    const existingRecordCompanyId = checkResult.rows[0].company_id;

    // Security check: Ensure user can delete this record
    if (req.user.role !== 'admin' && req.user.company_id !== existingRecordCompanyId) {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }

    // Proceed with deletion
    await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    console.error('Error deleting compressor record:', error);
    if (error.code === '42P01') {
      console.error('Table for compressor records likely does not exist.');
      return res.status(500).json({ error: 'Compressor records table not found. Please contact an administrator.' });
    }
    // Handle other potential errors
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { init }; 