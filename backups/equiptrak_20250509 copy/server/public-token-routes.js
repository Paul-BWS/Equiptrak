// server/public-token-routes.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('./db-config'); // Use the existing PostgreSQL connection

// Endpoint to generate a public token for a lift service record
router.post('/api/lift-service-records/:id/public-token', async (req, res) => {
  try {
    const recordId = req.params.id;
    
    // Generate a random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Update the record in the database with the new token
    const query = `
      UPDATE lift_service_records 
      SET public_access_token = $1 
      WHERE id = $2 
      RETURNING *
    `;
    
    const result = await db.query(query, [token, recordId]);
    
    // Check if record exists
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lift service record not found' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Public token generated successfully' 
    });
    
  } catch (error) {
    console.error('Error generating public token:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error generating public token' 
    });
  }
});

// Endpoint for retrieving public certificates
router.get('/api/public/lift-service-certificate/:id', async (req, res) => {
  try {
    const recordId = req.params.id;
    const token = req.query.token;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token is required' 
      });
    }
    
    // Query to get the record with the matching token
    const query = `
      SELECT 
        lsr.*,
        c.company_name,
        c.address,
        c.city,
        c.county,
        c.postcode,
        c.phone_number,
        c.email
      FROM lift_service_records lsr
      LEFT JOIN companies c ON lsr.company_id = c.id
      WHERE lsr.id = $1 AND lsr.public_access_token = $2
    `;
    
    const result = await db.query(query, [recordId, token]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Certificate not found or invalid token' 
      });
    }
    
    // Format the response data
    const record = result.rows[0];
    const company = {
      id: record.company_id,
      company_name: record.company_name,
      address: record.address,
      city: record.city,
      county: record.county,
      postcode: record.postcode,
      phone_number: record.phone_number,
      email: record.email
    };
    
    // Remove company fields from record
    delete record.company_name;
    delete record.address;
    delete record.city;
    delete record.county;
    delete record.postcode;
    delete record.phone_number;
    delete record.email;
    
    // Add company object to response
    record.company = company;
    
    return res.status(200).json(record);
    
  } catch (error) {
    console.error('Error retrieving public certificate:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving certificate' 
    });
  }
});

module.exports = router;