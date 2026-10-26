import express from 'express';
import * as transplantController from '../controllers/transplantController.js';
import { authenticateToken, isHospitalStaff, getUserHospital } from '../middleware/auth.js';
import { validateId } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);
router.use(getUserHospital);

router.get('/', isHospitalStaff, transplantController.getAllTransplants);
router.get('/:id', validateId, isHospitalStaff, transplantController.getTransplantById);
router.put('/:id/status', validateId, isHospitalStaff, transplantController.updateTransplantStatus);

export default router;
