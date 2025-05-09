const express = require('express');
const contactsRouter = require('./contacts');

const router = express.Router();

// Register all mobile routes
router.use(contactsRouter);

// We can add more mobile-specific routes here as we create them
// Example:
// router.use(require('./company'));
// router.use(require('./workOrders'));
// router.use(require('./service'));
// etc.

module.exports = router; 