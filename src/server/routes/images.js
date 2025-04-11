const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = path.join(__dirname, '../../public/uploads/logos');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Upload company logo
router.post('/companies/:id/logo', authenticateToken, upload.single('logo'), async (req, res) => {
  console.log('Received logo upload request:', {
    companyId: req.params.id,
    auth: !!req.headers.authorization,
    file: req.file ? {
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file received',
    body: req.body,
    headers: req.headers
  });

  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    if (!req.file) {
      console.log('No file uploaded in request');
      return res.status(400).json({ error: 'No file uploaded. Please select an image file.' });
    }

    // Ensure upload directory exists
    const uploadDir = path.join(__dirname, '../../public/uploads/logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Save the file path
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    
    // First, delete any existing logo for this company
    await pool.query(
      'DELETE FROM images WHERE entity_type = $1 AND entity_id = $2',
      ['company_logo', id]
    );
    
    // Then save the new logo
    const imageResult = await pool.query(
      `INSERT INTO images (
        id,
        entity_type,
        entity_id,
        file_name,
        file_path,
        file_type,
        file_size,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [
        uuidv4(),
        'company_logo',
        id,
        req.file.originalname,
        logoUrl,
        req.file.mimetype,
        req.file.size,
        userId
      ]
    );
    
    console.log('Image record created:', imageResult.rows[0]);

    res.json({
      success: true,
      logoUrl: logoUrl
    });
  } catch (error) {
    console.error('Error uploading logo:', {
      error: error.message,
      stack: error.stack,
      companyId: req.params.id,
      userId: req.user?.id
    });
    
    res.status(500).json({ 
      error: 'Failed to upload logo. Please try again.',
      details: error.message 
    });
  }
});

// Get company logo
router.get('/companies/:id/logo', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT logo_url FROM companies WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0 || !result.rows[0].logo_url) {
      return res.status(404).json({ error: 'Logo not found' });
    }
    
    res.json({
      success: true,
      logoUrl: result.rows[0].logo_url
    });
  } catch (error) {
    console.error('Error getting logo:', error);
    res.status(500).json({ error: 'Failed to get logo' });
  }
});

// Add a test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Image routes are working correctly!' });
});

module.exports = router; 