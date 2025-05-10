
// INSTRUCTIONS:
// 1. Copy this block BEFORE the catch-all route in index.js (around line 2527)
// 2. Delete the two problematic blocks:
//    - Lines ~2543-2687 (after server startup)
//    - Lines ~2690-2911 (the duplicate we extracted here)

// Compressor CRUD Operations
//--------------------------------------------------

// Get compressor records for a company
app.get('/api/compressors', authenticateToken, async (req, res) => {
  const { company_id } = req.query;

  if (!company_id) {
    return res.status(400).json({ error: 'Company ID is required' });
  }

  // Security check: Ensure user can access this company's data
  if (req.user.role !== 'admin' && req.user.company_id !== company_id) {
    return res.status(403).json({ error: 'Forbidden: Access denied' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM compressors_records WHERE company_id = $1 ORDER BY service_date DESC',
      [company_id]
    );
    console.log(`Found ${result.rows.length} compressor records for company ID ${company_id}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching compressor records:', error);
    // Check for specific table not found error
    if (error.code === '42P01') { // PostgreSQL error code for undefined table
        console.error('Table "compressors_records" likely does not exist.');
        return res.status(500).json({ error: 'Server configuration error: Compressor table not found.' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific compressor record
app.get('/api/compressors/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM compressors_records WHERE id = $1',
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
        console.error('Table "compressors_records" likely does not exist.');
        return res.status(500).json({ error: 'Server configuration error: Compressor table not found.' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new compressor record
app.post('/api/compressors', authenticateToken, async (req, res) => {
  const { company_id, ...recordData } = req.body;

  if (!company_id) {
    return res.status(400).json({ error: 'Company ID is required' });
  }

  // Security check: Ensure user can create records for this company
  if (req.user.role !== 'admin' && req.user.company_id !== company_id) {
    return res.status(403).json({ error: 'Forbidden: Access denied' });
  }

  // Define standard and potential columns (adapt based on your actual table)
  const standardCols = ['company_id', 'equipment_name', 'equipment_serial', 'service_date', 'certificate_number', 'status'];
  const allowedCols = [...standardCols /* add any other specific compressor columns here */];

  const cols = ['company_id'];
  const values = [company_id];
  const placeholders = ['$1'];
  let placeholderIndex = 2;

  for (const col of allowedCols) {
      if (col !== 'company_id' && recordData[col] !== undefined) {
          cols.push(col);
          values.push(recordData[col]);
          placeholders.push(`$${placeholderIndex++}`);
      }
  }

  // Add created_at and updated_at
  cols.push('created_at', 'updated_at');
  placeholders.push('CURRENT_TIMESTAMP', 'CURRENT_TIMESTAMP');

  const queryText = `
    INSERT INTO compressors_records (${cols.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING *
  `;

  try {
    const result = await pool.query(queryText, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating compressor record:', error);
    if (error.code === '42P01') {
        console.error('Table "compressors_records" likely does not exist.');
        return res.status(500).json({ error: 'Server configuration error: Compressor table not found.' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a compressor record
app.put('/api/compressors/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { company_id, ...recordData } = req.body; // Exclude company_id from direct update

  // First, fetch the existing record to check ownership
  try {
    const checkResult = await pool.query(
      'SELECT company_id FROM compressors_records WHERE id = $1',
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
    const allowedCols = [...standardCols /* add any other specific compressor columns here */ ];

    const setClauses = [];
    const values = [];
    let placeholderIndex = 1;

    for (const col of allowedCols) {
        if (recordData[col] !== undefined) {
            setClauses.push(`${col} = $${placeholderIndex++}`);
            values.push(recordData[col]);
        }
    }

    // Add updated_at
    setClauses.push('updated_at = CURRENT_TIMESTAMP');

    if (setClauses.length === 1) { // Only updated_at clause
        return res.status(400).json({ error: 'No fields provided for update' });
    }

    values.push(id); // Add id for the WHERE clause

    const queryText = `
      UPDATE compressors_records
      SET ${setClauses.join(', ')}
      WHERE id = $${placeholderIndex}
      RETURNING *
    `;

    const result = await pool.query(queryText, values);
    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error updating compressor record:', error);
     if (error.code === '42P01') {
        console.error('Table "compressors_records" likely does not exist.');
        return res.status(500).json({ error: 'Server configuration error: Compressor table not found.' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a compressor record
app.delete('/api/compressors/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

   // First, fetch the existing record to check ownership
  try {
    const checkResult = await pool.query(
      'SELECT company_id FROM compressors_records WHERE id = $1',
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
    await pool.query('DELETE FROM compressors_records WHERE id = $1', [id]);
    res.status(204).send(); // No content on successful deletion

  } catch (error) {
    console.error('Error deleting compressor record:', error);
    if (error.code === '42P01') {
        console.error('Table "compressors_records" likely does not exist.');
        return res.status(500).json({ error: 'Server configuration error: Compressor table not found.' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});
