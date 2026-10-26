import express from 'express';
import * as matchController from '../controllers/matchController.js';
import { authenticateToken, isHospitalStaff } from '../middleware/auth.js';
import { validateId } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', isHospitalStaff, matchController.getAllMatches);
router.get('/stats', isHospitalStaff, matchController.getMatchingStats);
router.get('/:id', validateId, isHospitalStaff, matchController.getMatchById);
router.get('/recipient/:recipientId', matchController.getRecipientMatches); // Allow patients to see their own matches
router.post('/:id/accept', validateId, isHospitalStaff, matchController.acceptMatch);
router.post('/:id/reject', validateId, isHospitalStaff, matchController.rejectMatch);

export default router;
