import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { validateId } from '../middleware/validation.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(isAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/deactivate', validateId, adminController.deactivateUser);
router.put('/users/:id/activate', validateId, adminController.activateUser);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/reports', adminController.generateReport);

export default router;
