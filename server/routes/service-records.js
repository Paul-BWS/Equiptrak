const express = require('express');
const router = express.Router();

// Function to initialize routes with app reference for authentication and database
function init(app) {
  const authenticateJWT = app.locals.authenticateToken;
  const pool = app.locals.pool; // Use the app's pool instead of creating a new one
  
  // Get all equipment for a company (combines service records, spot welders, and lift services)
  router.get('/all-equipment', authenticateJWT, async (req, res) => {
    try {
      const { companyId } = req.query;
      
      if (!companyId) {
        return res.status(400).json({ error: 'Company ID is required' });
      }
      
      // Query for regular service records
      const serviceRecordsQuery = `
        SELECT 
          id, 
          'service_record' as equipment_type,
          certificate_number,
          service_date,
          retest_date,
          engineer_name,
          equipment_name_1 as name,
          equipment_serial_1 as serial_number,
          status,
          company_id,
          created_at,
          updated_at
        FROM service_records 
        WHERE company_id = $1
      `;
      
      // Query for spot welders
      const spotWeldersQuery = `
        SELECT 
          id, 
          'spot_welder' as equipment_type,
          certificate_number,
          service_date,
          retest_date,
          engineer_name,
          model as name,
          serial_number,
          status,
          company_id,
          created_at,
          updated_at
        FROM spot_welders 
        WHERE company_id = $1
      `;
      
      // Query for lift services
      const liftServicesQuery = `
        SELECT 
          id, 
          'lift_service' as equipment_type,
          certificate_number,
          service_date,
          retest_date,
          engineer_name,
          model as name,
          serial_number,
          status,
          company_id,
          created_at,
          updated_at
        FROM lift_service_records 
        WHERE company_id = $1
      `;
      
      // Execute all queries in parallel
      const [serviceRecordsResult, spotWeldersResult, liftServicesResult] = await Promise.all([
        pool.query(serviceRecordsQuery, [companyId]),
        pool.query(spotWeldersQuery, [companyId]).catch(err => {
          console.log('Spot welders query failed (table might not exist):', err.message);
          return { rows: [] };
        }),
        pool.query(liftServicesQuery, [companyId]).catch(err => {
          console.log('Lift services query failed (table might not exist):', err.message);
          return { rows: [] };
        })
      ]);
      
      // Combine all results
      const allEquipment = [
        ...serviceRecordsResult.rows,
        ...spotWeldersResult.rows,
        ...liftServicesResult.rows
      ];
      
      // Sort by most recent service date
      allEquipment.sort((a, b) => {
        const dateA = a.service_date ? new Date(a.service_date) : new Date(0);
        const dateB = b.service_date ? new Date(b.service_date) : new Date(0);
        return dateB - dateA; // Sort descending (newest first)
      });
      
      res.json(allEquipment);
    } catch (error) {
      console.error('Error fetching all equipment:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  });
  
  // Get all service records for a company
  router.get('/', authenticateJWT, async (req, res) => {
    try {
      const { companyId } = req.query;
      
      let query = 'SELECT * FROM service_records';
      const queryParams = [];
      
      // Only filter by company if provided
      if (companyId) {
        query += ' WHERE company_id = $1';
        queryParams.push(companyId);
      }
      
      query += ' ORDER BY service_date DESC';
      
      const result = await pool.query(query, queryParams);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching service records:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get a specific service record
  router.get('/:id', authenticateJWT, async (req, res) => {
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
  
  // Create a new service record
  router.post('/', authenticateJWT, async (req, res) => {
    const client = await pool.connect();
  
    try {
      console.log('POST /api/service-records with body:', req.body);
      
      // Extract necessary fields from request body
      const {
        company_id, service_date, engineer_name, retest_date, notes, status,
        equipment1_name, equipment1_serial, 
        equipment2_name, equipment2_serial,
        equipment3_name, equipment3_serial,
        equipment4_name, equipment4_serial,
        equipment5_name, equipment5_serial,
        equipment6_name, equipment6_serial
      } = req.body;
      
      // Input Validation
      if (!company_id) throw new Error('company_id is required');
      if (!service_date) throw new Error('service_date is required');
      if (!engineer_name) throw new Error('engineer_name is required');
  
      await client.query('BEGIN');
  
      // Generate NEXT sequential certificate number
      const certificateNumber = await getNextCertificateNumber(client);
      
      // Correct INSERT statement with correct column names (underscores) - only up to 6
      const query = `
        INSERT INTO service_records (
          company_id, service_date, retest_date, engineer_name, certificate_number,
          notes, status, 
          equipment_name_1, equipment_serial_1, 
          equipment_name_2, equipment_serial_2,
          equipment_name_3, equipment_serial_3,
          equipment_name_4, equipment_serial_4,
          equipment_name_5, equipment_serial_5,
          equipment_name_6, equipment_serial_6
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING *
      `;
      
      // Correct values array mapping frontend keys to DB columns - only up to 6
      const values = [
        company_id,           // $1
        service_date,         // $2
        retest_date || null,  // $3
        engineer_name,        // $4
        certificateNumber,    // $5
        notes || '',         // $6
        status || 'pending',  // $7
        equipment1_name || null, // $8 -> equipment_name_1
        equipment1_serial || null, // $9 -> equipment_serial_1
        equipment2_name || null, // $10 -> equipment_name_2
        equipment2_serial || null, // $11 -> equipment_serial_2
        equipment3_name || null, // $12 -> equipment_name_3
        equipment3_serial || null, // $13 -> equipment_serial_3
        equipment4_name || null, // $14 -> equipment_name_4
        equipment4_serial || null, // $15 -> equipment_serial_4
        equipment5_name || null, // $16 -> equipment_name_5
        equipment5_serial || null, // $17 -> equipment_serial_5
        equipment6_name || null, // $18 -> equipment_name_6
        equipment6_serial || null  // $19 -> equipment_serial_6
      ];
      
      const result = await client.query(query, values);
      await client.query('COMMIT');
      res.status(201).json(result.rows[0]);
  
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating service record:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    } finally {
      client.release();
    }
  });
  
  // Update a service record
  router.put('/:id', authenticateJWT, async (req, res) => {
    try {
      const id = req.params.id;
      console.log('===== SERVICE RECORD UPDATE DEBUG =====');
      console.log(`PUT request received for record ID: ${id}`);
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      // Verify the record exists first
      const checkResult = await pool.query('SELECT id FROM service_records WHERE id = $1', [id]);
      
      if (checkResult.rows.length === 0) {
        console.log(`Record ${id} not found in database`);
        return res.status(404).json({ error: 'Service record not found' });
      }
      
      console.log(`Record found: ${id}`);
      
      // Extract only the fields we need from the request body to avoid extraneous data
      const { 
        service_date, 
        retest_date, 
        engineer_name, 
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
        equipment6_serial
      } = req.body;

      // Log the extracted key values
      console.log('Key values for update:');
      console.log('- service_date:', service_date);
      console.log('- engineer_name:', engineer_name);
      console.log('- equipment1_name:', equipment1_name);
      
      // Handle nulls explicitly and convert empty strings to nulls
      const cleanedValues = [
        service_date || null, 
        retest_date || null, 
        engineer_name || null, 
        notes || '',
        status || 'pending',
        (equipment1_name === '' ? null : equipment1_name), 
        (equipment1_serial === '' ? null : equipment1_serial), 
        (equipment2_name === '' ? null : equipment2_name), 
        (equipment2_serial === '' ? null : equipment2_serial),
        (equipment3_name === '' ? null : equipment3_name), 
        (equipment3_serial === '' ? null : equipment3_serial),
        (equipment4_name === '' ? null : equipment4_name), 
        (equipment4_serial === '' ? null : equipment4_serial),
        (equipment5_name === '' ? null : equipment5_name), 
        (equipment5_serial === '' ? null : equipment5_serial),
        (equipment6_name === '' ? null : equipment6_name), 
        (equipment6_serial === '' ? null : equipment6_serial),
        id
      ];
      
      console.log('Executing update query with values:', cleanedValues);
      
      // Log any potential data type issues
      console.log('Types of values:');
      console.log('- id:', typeof id);
      console.log('- service_date:', typeof service_date);
      console.log('- engineer_name:', typeof engineer_name);
      
      // Build and execute the update query but ONLY for equipment 1-6
      const updateQuery = `
        UPDATE service_records SET
          service_date = $1, 
          retest_date = $2, 
          engineer_name = $3, 
          notes = $4, 
          status = $5,
          equipment_name_1 = $6, 
          equipment_serial_1 = $7,
          equipment_name_2 = $8, 
          equipment_serial_2 = $9,
          equipment_name_3 = $10, 
          equipment_serial_3 = $11,
          equipment_name_4 = $12, 
          equipment_serial_4 = $13,
          equipment_name_5 = $14, 
          equipment_serial_5 = $15,
          equipment_name_6 = $16, 
          equipment_serial_6 = $17,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $18
        RETURNING *`;
      
      console.log('Update query:', updateQuery.replace(/\s+/g, ' '));
      
      const result = await pool.query(updateQuery, cleanedValues);
      
      if (result.rows.length === 0) {
        console.log('Update failed - no rows returned');
        return res.status(404).json({ error: 'Service record update failed' });
      }
      
      console.log(`Update successful for record ${id}`);
      console.log('Updated record:', result.rows[0]);
      console.log('====================================');
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('ERROR UPDATING SERVICE RECORD:');
      console.error(error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        error: 'Server error', 
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
      });
    }
  });
  
  // Delete a service record
  router.delete('/:id', authenticateJWT, async (req, res) => {
    try {
      const recordId = req.params.id;
      console.log(`DELETE request received for service record ID: ${recordId}`);
      
      // Check if record exists first 
      const checkResult = await pool.query('SELECT id FROM service_records WHERE id = $1', [recordId]);
      if (checkResult.rows.length === 0) {
        console.log(`Service record with ID ${recordId} not found`);
        return res.status(404).json({ error: 'Service record not found' });
      }
      
      console.log(`Deleting service record with ID: ${recordId}`);
      const result = await pool.query(
        'DELETE FROM service_records WHERE id = $1 RETURNING *',
        [recordId]
      );
      
      if (result.rows.length === 0) {
        console.log(`No rows returned after deletion attempt for ID: ${recordId}`);
        return res.status(404).json({ error: 'Service record not found' });
      }
      
      console.log(`Successfully deleted service record with ID: ${recordId}`);
      res.json({ message: 'Service record deleted successfully' });
    } catch (error) {
      console.error('Error deleting service record:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get next certificate number
  async function getNextCertificateNumber(client) {
    let nextNum = 1000;
    
    const res = await client.query(
      "SELECT certificate_number FROM service_records ORDER BY id DESC LIMIT 1"
    );
  
    if (res.rows.length > 0) {
      const lastCert = res.rows[0].certificate_number;
      const lastNumMatch = lastCert.match(/BWS-([0-9]+)/);
      if (lastNumMatch && lastNumMatch[1]) {
        nextNum = parseInt(lastNumMatch[1], 10) + 1;
      }
    }
  
    return `BWS-${nextNum}`;
  }

  return router;
}

module.exports = init; 