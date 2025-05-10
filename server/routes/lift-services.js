const express = require('express');
const router = express.Router();

// Function to initialize routes with app reference for authentication and database
function init(app) {
  console.log('[LIFT_SERVICES] Initializing lift services routes');
  
  if (!app || !app.locals) {
    console.error('[LIFT_SERVICES] Error: app or app.locals not provided');
    return router;
  }

  const pool = app.locals.pool;
  const authenticateJWT = app.locals.authenticateToken;

  if (!pool) {
    console.error('[LIFT_SERVICES] Error: database pool not found in app.locals');
  }
  if (!authenticateJWT) {
    console.error('[LIFT_SERVICES] Error: authenticateToken not found in app.locals');
  }

  // Get all lift service records (with optional company filter)
  router.get('/', authenticateJWT, async (req, res) => {
    try {
      console.log('[LIFT_SERVICES] GET request received with query:', req.query);
      const { company_id } = req.query;
      let query = `
        SELECT lsr.*, c.company_name 
        FROM lift_service_records lsr
        LEFT JOIN companies c ON lsr.company_id = c.id
      `;
      
      const params = [];
      if (company_id) {
        query += ` WHERE lsr.company_id = $1`;
        params.push(company_id);
      }
      
      query += ` ORDER BY lsr.created_at DESC`;
      
      console.log('[LIFT_SERVICES] Executing query:', query, 'with params:', params);
      const result = await pool.query(query, params);
      console.log(`[LIFT_SERVICES] Found ${result.rows.length} records`);
      res.json(result.rows);
    } catch (error) {
      console.error('[LIFT_SERVICES] Error fetching lift service records:', error);
      res.status(500).json({ error: 'Failed to fetch lift service records' });
    }
  });

  // Get a single lift service record by ID
  router.get('/:id', authenticateJWT, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT lsr.*, c.company_name 
         FROM lift_service_records lsr
         LEFT JOIN companies c ON lsr.company_id = c.id
         WHERE lsr.id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Lift service record not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching lift service record:', error);
      res.status(500).json({ error: 'Failed to fetch lift service record' });
    }
  });

  // Create a new lift service record
  router.post('/', authenticateJWT, async (req, res) => {
    try {
      const {
        company_id,
        product_category,
        model,
        serial_number,
        certificate_number,
        service_date,
        retest_date,
        engineer_name,
        signature_image,
        swl,
        notes,
        safe_working_test,
        emergency_stops_test,
        limit_switches_test,
        safety_devices_test,
        hydraulic_system_test,
        pressure_relief_test,
        electrical_system_test,
        platform_operation_test,
        fail_safe_devices_test,
        lifting_structure_test,
        status
      } = req.body;

      const result = await pool.query(
        `INSERT INTO lift_service_records (
          company_id, product_category, model, serial_number, certificate_number,
          service_date, retest_date, engineer_name, signature_image, swl,
          notes, safe_working_test, emergency_stops_test, limit_switches_test,
          safety_devices_test, hydraulic_system_test, pressure_relief_test,
          electrical_system_test, platform_operation_test, fail_safe_devices_test,
          lifting_structure_test, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
        RETURNING *`,
        [
          company_id, product_category, model, serial_number, certificate_number,
          service_date, retest_date, engineer_name, signature_image, swl,
          notes, safe_working_test, emergency_stops_test, limit_switches_test,
          safety_devices_test, hydraulic_system_test, pressure_relief_test,
          electrical_system_test, platform_operation_test, fail_safe_devices_test,
          lifting_structure_test, status
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating lift service record:', error);
      res.status(500).json({ error: 'Failed to create lift service record' });
    }
  });

  // Update a lift service record
  router.put('/:id', authenticateJWT, async (req, res) => {
    try {
      const { id } = req.params;
      const {
        product_category,
        model,
        serial_number,
        certificate_number,
        service_date,
        retest_date,
        engineer_name,
        signature_image,
        swl,
        notes,
        safe_working_test,
        emergency_stops_test,
        limit_switches_test,
        safety_devices_test,
        hydraulic_system_test,
        pressure_relief_test,
        electrical_system_test,
        platform_operation_test,
        fail_safe_devices_test,
        lifting_structure_test,
        status
      } = req.body;

      const result = await pool.query(
        `UPDATE lift_service_records SET
          product_category = $1, model = $2, serial_number = $3,
          certificate_number = $4, service_date = $5, retest_date = $6,
          engineer_name = $7, signature_image = $8, swl = $9,
          notes = $10, safe_working_test = $11, emergency_stops_test = $12,
          limit_switches_test = $13, safety_devices_test = $14,
          hydraulic_system_test = $15, pressure_relief_test = $16,
          electrical_system_test = $17, platform_operation_test = $18,
          fail_safe_devices_test = $19, lifting_structure_test = $20,
          status = $21, updated_at = CURRENT_TIMESTAMP
        WHERE id = $22
        RETURNING *`,
        [
          product_category, model, serial_number, certificate_number,
          service_date, retest_date, engineer_name, signature_image,
          swl, notes, safe_working_test, emergency_stops_test,
          limit_switches_test, safety_devices_test, hydraulic_system_test,
          pressure_relief_test, electrical_system_test, platform_operation_test,
          fail_safe_devices_test, lifting_structure_test, status, id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Lift service record not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating lift service record:', error);
      res.status(500).json({ error: 'Failed to update lift service record' });
    }
  });

  // Delete a lift service record
  router.delete('/:id', authenticateJWT, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'DELETE FROM lift_service_records WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Lift service record not found' });
      }

      res.json({ message: 'Lift service record deleted successfully' });
    } catch (error) {
      console.error('Error deleting lift service record:', error);
      res.status(500).json({ error: 'Failed to delete lift service record' });
    }
  });

  return router;
}

module.exports = { init }; 