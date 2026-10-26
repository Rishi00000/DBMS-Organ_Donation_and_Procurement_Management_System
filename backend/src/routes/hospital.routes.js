import express from 'express';
import * as hospitalController from '../controllers/hospitalController.js';
import { authenticateToken, isAdmin, getUserHospital } from '../middleware/auth.js';
import { validateHospital, validateId } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);
router.use(getUserHospital);

router.get('/my-hospital', hospitalController.getMyHospital);
router.get('/', hospitalController.getAllHospitals);
router.get('/:id', validateId, hospitalController.getHospitalById);
router.post('/', validateHospital, hospitalController.createHospital);
router.put('/:id', validateId, hospitalController.updateHospital);

// Admin only routes
router.put('/:id/approve', validateId, isAdmin, hospitalController.approveHospital);
router.put('/:id/reject', validateId, isAdmin, hospitalController.rejectHospital);
router.get('/:id/staff', validateId, hospitalController.getHospitalStaff);

export default router;
