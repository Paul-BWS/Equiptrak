import express from 'express';
import contactsRouter from './contacts';

const router = express.Router();

// Register all mobile routes
router.use(contactsRouter);

// We can add more mobile-specific routes here as we create them
// Example:
// router.use(companyRouter);
// router.use(workOrdersRouter);
// router.use(serviceRouter);
// etc.

export default router; 