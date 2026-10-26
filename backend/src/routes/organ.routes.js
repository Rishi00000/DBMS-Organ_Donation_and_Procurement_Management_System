import express from 'express';
import * as organController from '../controllers/organController.js';
import { authenticateToken, isHospitalStaff, getUserHospital } from '../middleware/auth.js';
import { validateOrgan, validateId } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);
router.use(getUserHospital);

router.get('/', isHospitalStaff, organController.getAllOrgans);
router.get('/available', isHospitalStaff, organController.getAvailableOrgans);
router.get('/:id', validateId, isHospitalStaff, organController.getOrganById);
router.post('/', validateOrgan, isHospitalStaff, organController.createOrgan);
router.put('/:id', validateId, isHospitalStaff, organController.updateOrgan);
router.delete('/:id', validateId, isHospitalStaff, organController.deleteOrgan);
router.post('/:id/match', validateId, isHospitalStaff, organController.triggerMatching);

export default router;
