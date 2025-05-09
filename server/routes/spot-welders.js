const express = require('express');
const router = express.Router();

// Function to initialize routes with app reference for authentication and database
function init(app) {
  const authenticateJWT = app.locals.authenticateToken;
  const pool = app.locals.pool; // Use the app's pool instead of creating a new one
  
  // Get all spot welders for a company
  router.get('/', authenticateJWT, async (req, res) => {
    try {
      const { company_id } = req.query;
      
      if (!company_id) {
        return res.status(400).json({ error: 'Company ID is required' });
      }
      
      const result = await pool.query(
        'SELECT * FROM spot_welder_records WHERE company_id = $1 ORDER BY service_date DESC',
        [company_id]
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching spot welders:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Get a single spot welder
  router.get('/:id', authenticateJWT, async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        'SELECT * FROM spot_welder_records WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Spot welder not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching spot welder:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Create a new spot welder
  router.post('/', authenticateJWT, async (req, res) => {
    try {
      console.log('Creating spot welder, received data:', JSON.stringify(req.body));
      
      const { 
        company_id, certificate_number, service_date, retest_date,
        model, serial_number, engineer_name, equipment_type, status,
        voltage_max, voltage_min, air_pressure, tip_pressure,
        length, diameter,
        machine1, meter1, machine_time1, meter_time1,
        machine2, meter2, machine_time2, meter_time2,
        machine3, meter3, machine_time3, meter_time3,
        machine4, meter4, machine_time4, meter_time4,
        notes
      } = req.body;
      
      if (!company_id) {
        return res.status(400).json({ error: 'Company ID is required' });
      }
      
      // Using status as Active by default if not provided
      const recordStatus = status || "Active";
      
      console.log('Inserting into database with values:', {
        company_id, certificate_number, service_date, retest_date,
        status: recordStatus, model, serial_number, engineer_name, equipment_type
      });
      
      // Check if table exists and get column information
      const tableInfo = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'spot_welder_records'
        ORDER BY ordinal_position;
      `);
      
      console.log('Table columns:', tableInfo.rows.map(row => row.column_name));
      
      // Get actual column count to ensure correct parameter usage
      const columnCount = tableInfo.rows.length;
      console.log('Total column count:', columnCount);
      
      // Construct dynamically the exact columns from the database
      const columnNames = tableInfo.rows.map(row => row.column_name)
        .filter(name => name !== 'id' && name !== 'created_at' && name !== 'updated_at')
        .join(', ');
      
      // Create the correct number of placeholders based on actual columns
      const valuePlaceholders = tableInfo.rows
        .filter(row => row.column_name !== 'id' && row.column_name !== 'created_at' && row.column_name !== 'updated_at')
        .map((_, index) => `$${index + 1}`)
        .join(', ');
      
      console.log('Using columns:', columnNames);
      console.log('Using placeholders:', valuePlaceholders);
      
      // Manually constructing values array to match column order from the database
      const values = [];
      
      // Map the values in the same order as the column names
      for (const row of tableInfo.rows) {
        const colName = row.column_name;
        
        // Skip auto-generated columns
        if (colName === 'id' || colName === 'created_at' || colName === 'updated_at') {
          continue;
        }
        
        // Add the value if it exists in the request, or null if it doesn't
        if (colName === 'status') {
          values.push(recordStatus);
        } else if (colName in req.body) {
          // Check if this is a numeric field with empty string value
          const value = req.body[colName];
          
          // Convert empty strings to null for potentially numeric fields
          if (value === "" && ['voltage_max', 'voltage_min', 'air_pressure', 'tip_pressure', 'length', 'diameter'].includes(colName)) {
            values.push(null);
          } else {
            values.push(value);
          }
        } else {
          values.push(null);
        }
      }
      
      console.log('Values array length:', values.length);
      
      // Use simplified query that dynamically adjusts to the database schema
      const query = `
        INSERT INTO spot_welder_records (${columnNames}) 
        VALUES (${valuePlaceholders})
        RETURNING *`;
      
      console.log('Executing query:', query);
      
      const result = await pool.query(query, values);
      
      console.log('Spot welder created successfully:', result.rows[0].id);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating spot welder:', error);
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  });
  
  // Update a spot welder
  router.put('/:id', authenticateJWT, async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        certificate_number, service_date, retest_date,
        model, serial_number, engineer_name, equipment_type,
        voltage_max, voltage_min, air_pressure, tip_pressure,
        length, diameter,
        machine1, meter1, machine_time1, meter_time1,
        machine2, meter2, machine_time2, meter_time2,
        machine3, meter3, machine_time3, meter_time3,
        machine4, meter4, machine_time4, meter_time4,
        notes
      } = req.body;
      
      const result = await pool.query(
        `UPDATE spot_welder_records SET
          certificate_number = $1, service_date = $2, retest_date = $3,
          model = $4, serial_number = $5, engineer_name = $6, equipment_type = $7,
          voltage_max = $8, voltage_min = $9, air_pressure = $10, tip_pressure = $11,
          length = $12, diameter = $13,
          machine1 = $14, meter1 = $15, machine_time1 = $16, meter_time1 = $17,
          machine2 = $18, meter2 = $19, machine_time2 = $20, meter_time2 = $21,
          machine3 = $22, meter3 = $23, machine_time3 = $24, meter_time3 = $25,
          machine4 = $26, meter4 = $27, machine_time4 = $28, meter_time4 = $29,
          notes = $30,
          updated_at = CURRENT_TIMESTAMP
          WHERE id = $31
          RETURNING *`,
        [
          certificate_number, service_date, retest_date,
          model, serial_number, engineer_name, equipment_type,
          voltage_max, voltage_min, air_pressure, tip_pressure,
          length, diameter,
          machine1, meter1, machine_time1, meter_time1,
          machine2, meter2, machine_time2, meter_time2,
          machine3, meter3, machine_time3, meter_time3,
          machine4, meter4, machine_time4, meter_time4,
          notes, id
        ]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Spot welder not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating spot welder:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Delete a spot welder
  router.delete('/:id', authenticateJWT, async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        'DELETE FROM spot_welder_records WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Spot welder not found' });
      }
      
      res.json({ message: 'Spot welder deleted successfully' });
    } catch (error) {
      console.error('Error deleting spot welder:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Generate public access token for a spot welder
  router.post('/:id/public-token', authenticateJWT, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if the spot welder exists
      const checkResult = await pool.query(
        'SELECT id FROM spot_welder_records WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Spot welder record not found' });
      }
      
      // Generate a random token
      const token = require('crypto').randomBytes(32).toString('hex');
      
      // Check if the public_access_token column exists
      const columnCheck = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'spot_welder_records' AND column_name = 'public_access_token'
      `);
      
      // If the column doesn't exist, create it
      if (columnCheck.rows.length === 0) {
        await pool.query(`
          ALTER TABLE spot_welder_records 
          ADD COLUMN public_access_token TEXT
        `);
        console.log('Added public_access_token column to spot_welder_records table');
      }
      
      // Update the record with the token
      const updateResult = await pool.query(
        'UPDATE spot_welder_records SET public_access_token = $1 WHERE id = $2 RETURNING id, public_access_token',
        [token, id]
      );
      
      res.json({
        id: updateResult.rows[0].id,
        public_access_token: updateResult.rows[0].public_access_token
      });
    } catch (error) {
      console.error('Error generating public access token for spot welder:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  return router;
}

module.exports = { init }; 