const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { pool } = require('../../db-config');

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

// Get a specific contact
router.get('/api/companies/:id/contacts/:contactId', authenticateToken, async (req, res) => {
  try {
    const { id: companyId, contactId } = req.params;
    console.log(`[Mobile Contacts Route] Fetching contact ${contactId} for company ${companyId}`);

    const result = await pool.query(
      `SELECT * FROM contacts
       WHERE id = $1 AND company_id = $2`,
      [contactId, companyId]
    );

    if (result.rows.length === 0) {
      console.log(`[Mobile Contacts Route] Contact ${contactId} not found`);
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[Mobile Contacts Route] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a contact's primary status
router.patch('/api/companies/:id/contacts/:contactId', authenticateToken, async (req, res) => {
  try {
    const { id: companyId, contactId } = req.params;
    const { is_primary } = req.body;
    console.log(`[Mobile Contacts Route] Updating contact ${contactId} primary status to ${is_primary}`);

    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // If setting as primary, unset any existing primary contact
      if (is_primary) {
        await client.query(
          `UPDATE contacts
           SET is_primary = false
           WHERE company_id = $1 AND is_primary = true`,
          [companyId]
        );
      }

      // Update the target contact
      const result = await client.query(
        `UPDATE contacts
         SET is_primary = $1
         WHERE id = $2 AND company_id = $3
         RETURNING *`,
        [is_primary, contactId, companyId]
      );

      await client.query('COMMIT');

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[Mobile Contacts Route] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a contact
router.delete('/api/companies/:id/contacts/:contactId', authenticateToken, async (req, res) => {
  try {
    const { id: companyId, contactId } = req.params;
    console.log(`[Mobile Contacts Route] Deleting contact ${contactId} from company ${companyId}`);

    const result = await pool.query(
      `DELETE FROM contacts
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
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

module.exports = router; 