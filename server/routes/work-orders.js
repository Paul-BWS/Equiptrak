const express = require('express');
const router = express.Router();
const { pool } = require('../db-config');
const { authenticateToken } = require('../middleware/auth');

// Get work orders (all or by company ID)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const companyId = req.query.companyId;
    const search = req.query.search;
    
    let query = `
      SELECT 
        wo.*,
        c.company_name
      FROM work_orders wo
      JOIN companies c ON wo.company_id = c.id
    `;

    const params = [];
    const conditions = [];

    if (companyId) {
      conditions.push('wo.company_id = $' + (params.length + 1));
      params.push(companyId);
    }

    if (search) {
      conditions.push(`(
        c.company_name ILIKE $${params.length + 1} OR 
        wo.description ILIKE $${params.length + 1} OR 
        wo.job_tracker ILIKE $${params.length + 1} OR
        wo.work_order_number ILIKE $${params.length + 1}
      )`);
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY wo.date DESC';

    console.log('Executing query:', query, 'with params:', params);
    const result = await pool.query(query, params);
    console.log(`Found ${result.rows.length} work orders`);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching work orders:', err);
    res.status(500).json({ error: 'Failed to fetch work orders' });
  }
});

// Get single work order by work_order_number
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching work order:', id);

    // Query to get work order with company name and items
    const workOrderQuery = `
      SELECT 
        wo.*,
        c.company_name,
        json_agg(
          json_build_object(
            'id', woi.id,
            'sku', woi.sku,
            'description', woi.description,
            'quantity', woi.quantity,
            'price', woi.price,
            'subtotal', woi.subtotal
          )
        ) FILTER (WHERE woi.id IS NOT NULL) as items
      FROM work_orders wo
      JOIN companies c ON wo.company_id = c.id
      LEFT JOIN work_order_items woi ON wo.id = woi.work_order_id
      WHERE wo.work_order_number = $1
      GROUP BY wo.id, c.company_name
    `;

    const result = await pool.query(workOrderQuery, [id]);
    
    if (result.rows.length === 0) {
      console.log('Work order not found:', id);
      return res.status(404).json({ error: 'Work order not found' });
    }

    const workOrder = result.rows[0];
    console.log('Found work order:', workOrder.work_order_number);
    
    // Ensure items is an empty array if null
    workOrder.items = workOrder.items || [];
    
    res.json(workOrder);
  } catch (error) {
    console.error('Error fetching work order:', error);
    res.status(500).json({ error: 'Failed to fetch work order' });
  }
});

// Create new work order
router.post('/', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    console.log('Creating new work order with data:', JSON.stringify(req.body, null, 2));
    
    const {
      company_id,
      date,
      job_tracker,
      order_number,
      taken_by,
      staff,
      status,
      description,
      internal_notes,
      quickbooks_ref,
      type,
      carrier,
      total,
      vat_rate,
      vat,
      discount,
      items
    } = req.body;

    // Validate required fields
    if (!company_id) {
      return res.status(400).json({ error: 'company_id is required' });
    }
    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }

    // Start transaction
    await client.query('BEGIN');

    console.log('Starting work order creation transaction');

    // Generate work order number
    const workOrderNumberResult = await client.query('SELECT generate_work_order_number()');
    const workOrderNumber = workOrderNumberResult.rows[0].generate_work_order_number;

    // Insert work order
    const workOrderQuery = `
      INSERT INTO work_orders (
        company_id, work_order_number, date, job_tracker, order_number, taken_by, staff,
        status, description, internal_notes, quickbooks_ref, type, carrier, total, vat_rate, vat, discount,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
      RETURNING *
    `;

    const workOrderValues = [
      company_id,
      workOrderNumber,
      date,
      job_tracker || '',
      order_number || '',
      taken_by || '',
      staff || '',
      status || 'draft',
      description || '',
      internal_notes || '',
      quickbooks_ref || '',
      type || '',
      carrier || '',
      total || 0,
      vat_rate || 0,
      vat || 0,
      discount || 0
    ];

    console.log('Executing work order insert with values:', workOrderValues);
    const workOrderResult = await client.query(workOrderQuery, workOrderValues);
    const workOrder = workOrderResult.rows[0];
    console.log('Work order created with ID:', workOrder.id);

    // Insert work order items
    if (items && items.length > 0) {
      console.log(`Adding ${items.length} items to work order`);
      const itemsQuery = `
        INSERT INTO work_order_items (
          work_order_id, product_id, sku, description, quantity, price, subtotal,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      `;

      for (const item of items) {
        await client.query(itemsQuery, [
          workOrder.id,
          item.product_id,
          item.sku || '',
          item.description || '',
          item.quantity || 1,
          item.price || 0,
          item.subtotal || 0
        ]);
      }
      console.log('All items added successfully');
    }

    await client.query('COMMIT');
    console.log('Transaction committed successfully');

    // Return the complete work order with its ID
    res.status(201).json({
      ...workOrder,
      message: 'Work order created successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating work order:', error);
    res.status(500).json({ error: 'Failed to create work order', details: error.message });
  } finally {
    client.release();
  }
});

// Delete work order
router.delete('/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    console.log(`Attempting to delete work order with ID: ${id}`);

    // Start transaction
    await client.query('BEGIN');

    // First delete related items
    await client.query('DELETE FROM work_order_items WHERE work_order_id = $1', [id]);
    console.log('Deleted related work order items');

    // Then delete the work order
    const result = await client.query('DELETE FROM work_orders WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Work order not found' });
    }

    await client.query('COMMIT');
    console.log('Work order deleted successfully');
    
    res.json({ message: 'Work order deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting work order:', error);
    res.status(500).json({ error: 'Failed to delete work order' });
  } finally {
    client.release();
  }
});

// Add items to work order
router.post('/:id/items', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }

    // Start transaction
    await client.query('BEGIN');

    // Get the work order ID from the work_order_number
    const workOrderResult = await client.query(
      'SELECT id FROM work_orders WHERE work_order_number = $1',
      [id]
    );

    if (workOrderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Work order not found' });
    }

    const workOrderId = workOrderResult.rows[0].id;

    // Insert items
    const itemsQuery = `
      INSERT INTO work_order_items (
        work_order_id, product_id, sku, description, quantity, price, subtotal,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;

    const insertedItems = [];
    for (const item of items) {
      const result = await client.query(itemsQuery, [
        workOrderId,
        item.id, // product_id
        item.sku || '',
        item.name || item.description || '',
        item.quantity || 1,
        item.price || 0,
        (item.quantity || 1) * (item.price || 0) // subtotal
      ]);
      insertedItems.push(result.rows[0]);
    }

    // Update work order totals
    const totalsQuery = `
      UPDATE work_orders
      SET 
        total = (
          SELECT COALESCE(SUM(subtotal), 0)
          FROM work_order_items
          WHERE work_order_id = $1
        ),
        vat = (
          SELECT COALESCE(SUM(subtotal), 0) * (vat_rate / 100)
          FROM work_order_items
          WHERE work_order_id = $1
        ),
        updated_at = NOW()
      WHERE id = $1
      RETURNING total, vat
    `;

    const totalsResult = await client.query(totalsQuery, [workOrderId]);

    await client.query('COMMIT');

    res.json({
      items: insertedItems,
      totals: totalsResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding items to work order:', error);
    res.status(500).json({ error: 'Failed to add items to work order' });
  } finally {
    client.release();
  }
});

// Remove item from work order
router.delete('/:id/items/:itemId', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id, itemId } = req.params;

    // Start transaction
    await client.query('BEGIN');

    // Get the work order ID from the work_order_number
    const workOrderResult = await client.query(
      'SELECT id FROM work_orders WHERE work_order_number = $1',
      [id]
    );

    if (workOrderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Work order not found' });
    }

    const workOrderId = workOrderResult.rows[0].id;

    // Delete the item
    const deleteResult = await client.query(
      'DELETE FROM work_order_items WHERE id = $1 AND work_order_id = $2 RETURNING *',
      [itemId, workOrderId]
    );

    if (deleteResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Item not found' });
    }

    // Update work order totals
    const totalsQuery = `
      UPDATE work_orders
      SET 
        total = (
          SELECT COALESCE(SUM(subtotal), 0)
          FROM work_order_items
          WHERE work_order_id = $1
        ),
        vat = (
          SELECT COALESCE(SUM(subtotal), 0) * (vat_rate / 100)
          FROM work_order_items
          WHERE work_order_id = $1
        ),
        updated_at = NOW()
      WHERE id = $1
      RETURNING total, vat
    `;

    const totalsResult = await client.query(totalsQuery, [workOrderId]);

    await client.query('COMMIT');

    res.json({
      message: 'Item removed successfully',
      totals: totalsResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error removing item from work order:', error);
    res.status(500).json({ error: 'Failed to remove item from work order' });
  } finally {
    client.release();
  }
});

// Update work order
router.patch('/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Start transaction
    await client.query('BEGIN');

    // Get the work order ID from the work_order_number
    const workOrderResult = await client.query(
      'SELECT id FROM work_orders WHERE work_order_number = $1',
      [id]
    );

    if (workOrderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Work order not found' });
    }

    const workOrderId = workOrderResult.rows[0].id;

    // Build update query dynamically based on provided fields
    const allowedFields = [
      'date', 'job_tracker', 'order_number', 'taken_by', 'staff',
      'status', 'description', 'internal_notes', 'quickbooks_ref',
      'vat_rate', 'discount', 'type', 'carrier'
    ];

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Add updated_at
    updateFields.push(`updated_at = NOW()`);

    const updateQuery = `
      UPDATE work_orders
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    values.push(workOrderId);

    const result = await client.query(updateQuery, values);
    await client.query('COMMIT');

    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating work order:', error);
    res.status(500).json({ error: 'Failed to update work order' });
  } finally {
    client.release();
  }
});

module.exports = router; 