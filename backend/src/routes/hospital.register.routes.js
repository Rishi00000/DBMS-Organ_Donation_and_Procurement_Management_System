import express from 'express';
import {
  registerHospital,
  getPendingHospitals,
  approveHospital,
  rejectHospital
} from '../controllers/hospitalRegisterController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public route for hospital registration
router.post('/register', registerHospital);

// Admin-only routes
router.get('/pending', authenticateToken, isAdmin, getPendingHospitals);
router.put('/:hospitalId/approve', authenticateToken, isAdmin, approveHospital);
router.put('/:hospitalId/reject', authenticateToken, isAdmin, rejectHospital);

export default router;
