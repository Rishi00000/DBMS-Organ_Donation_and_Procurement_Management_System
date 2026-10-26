import express from 'express';
import * as donorController from '../controllers/donorController.js';
import { authenticateToken, isHospitalStaff, getUserHospital } from '../middleware/auth.js';
import { validateDonor, validateId } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);
router.use(getUserHospital);

router.get('/', isHospitalStaff, donorController.getAllDonors);
router.get('/:id', validateId, isHospitalStaff, donorController.getDonorById);
router.post('/', validateDonor, isHospitalStaff, donorController.createDonor);
router.put('/:id', validateId, isHospitalStaff, donorController.updateDonor);
router.delete('/:id', validateId, isHospitalStaff, donorController.deleteDonor);

export default router;
