const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

function init(app) {
  const { pool } = app.locals;

  // Session check endpoint
  router.get('/session', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await pool.query(
        'SELECT id, email, role, company_id FROM users WHERE id = $1',
        [decoded.userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      const user = result.rows[0];
      res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          company_id: user.company_id,
          token // Include the token in the response
        }
      });
    } catch (error) {
      console.error('Session verification error:', error);
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  });

  return router;
}

module.exports = { init }; 