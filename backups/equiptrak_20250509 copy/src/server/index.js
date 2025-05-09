const express = require('express');
const cors = require('cors');
const path = require('path');
const imagesRoutes = require('./routes/images');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/images', imagesRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/uploads/logos', express.static(path.join(__dirname, '../public/uploads/logos')));

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running correctly!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://${require('os').networkInterfaces()['en0']?.[1]?.address || 'localhost'}:${PORT}`);
});

module.exports = app; 