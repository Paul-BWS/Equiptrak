import express from 'express';
import { authenticateToken } from '@/middleware/auth';
import { pool } from '@/db-config';

const router = express.Router();

// Get all contacts for a company
router.get('/api/companies/:id/contacts', authenticateToken, async (req, res) => {
  try {
    const companyId = req.params.id;
    console.log(`[Mobile Contacts Route] Received request for companyId: ${companyId}`);

    // First check if company exists
    const companyCheck = await pool.query(
      'SELECT id FROM companies WHERE id = $1',
      [companyId]
    );

    if (companyCheck.rows.length === 0) {
      console.log(`[Mobile Contacts Route] Company ${companyId} not found`);
      return res.status(404).json({ error: 'Company not found' });
    }

    const result = await pool.query(
      `SELECT * FROM contacts
       WHERE company_id = $1
       ORDER BY is_primary DESC, first_name, last_name`,
      [companyId]
    );

    console.log(`[Mobile Contacts Route] Found ${result.rows.length} contacts`);
    res.json(result.rows);
  } catch (error) {
    console.error('[Mobile Contacts Route] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new contact
router.post('/api/companies/:id/contacts', authenticateToken, async (req, res) => {
  try {
    const companyId = req.params.id;
    const {
      first_name,
      last_name,
      email,
      telephone,
      mobile,
      job_title,
      is_primary
    } = req.body;

    // If this contact is primary, update other contacts to not be primary
    if (is_primary) {
      await pool.query(
        'UPDATE contacts SET is_primary = false WHERE company_id = $1',
        [companyId]
      );
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [companyId, first_name, last_name, email, telephone, mobile, job_title, is_primary]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('[Mobile Contacts Route] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a contact
router.put('/api/companies/:companyId/contacts/:contactId', authenticateToken, async (req, res) => {
  try {
    const { companyId, contactId } = req.params;
    const {
      first_name,
      last_name,
      email,
      telephone,
      mobile,
      job_title,
      is_primary
    } = req.body;

    // If this contact is being made primary, update other contacts
    if (is_primary) {
      await pool.query(
        'UPDATE contacts SET is_primary = false WHERE company_id = $1 AND id != $2',
        [companyId, contactId]
      );
    }

    const result = await pool.query(
      `UPDATE contacts SET
        first_name = $1,
        last_name = $2,
        email = $3,
        telephone = $4,
        mobile = $5,
        job_title = $6,
        is_primary = $7
      WHERE id = $8 AND company_id = $9
      RETURNING *`,
      [first_name, last_name, email, telephone, mobile, job_title, is_primary, contactId, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[Mobile Contacts Route] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a contact
router.delete('/api/companies/:companyId/contacts/:contactId', authenticateToken, async (req, res) => {
  try {
    const { companyId, contactId } = req.params;

    const result = await pool.query(
      'DELETE FROM contacts WHERE id = $1 AND company_id = $2 RETURNING *',
      [contactId, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('[Mobile Contacts Route] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle primary status
router.patch('/api/companies/:companyId/contacts/:contactId/toggle-primary', authenticateToken, async (req, res) => {
  try {
    const { companyId, contactId } = req.params;

    // Get current primary status
    const currentStatus = await pool.query(
      'SELECT is_primary FROM contacts WHERE id = $1 AND company_id = $2',
      [contactId, companyId]
    );

    if (currentStatus.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const newPrimaryStatus = !currentStatus.rows[0].is_primary;

    // If making this contact primary, remove primary from others
    if (newPrimaryStatus) {
      await pool.query(
        'UPDATE contacts SET is_primary = false WHERE company_id = $1 AND id != $2',
        [companyId, contactId]
      );
    }

    // Update this contact's primary status
    const result = await pool.query(
      'UPDATE contacts SET is_primary = $1 WHERE id = $2 AND company_id = $3 RETURNING *',
      [newPrimaryStatus, contactId, companyId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[Mobile Contacts Route] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 