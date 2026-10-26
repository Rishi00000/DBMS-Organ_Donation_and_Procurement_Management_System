import express from 'express';
import * as recipientController from '../controllers/recipientController.js';
import { authenticateToken, isHospitalStaff, getUserHospital } from '../middleware/auth.js';
import { validateRecipient, validateId } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);
router.use(getUserHospital);

router.get('/', recipientController.getAllRecipients); // Allow patients to see their own data
router.get('/waitlist', isHospitalStaff, recipientController.getActiveWaitlist);
router.get('/:id', validateId, recipientController.getRecipientById);
router.post('/', validateRecipient, isHospitalStaff, recipientController.createRecipient);
router.put('/:id', validateId, recipientController.updateRecipient); // Allow patients to update their own contact info
router.delete('/:id', validateId, isHospitalStaff, recipientController.deleteRecipient);

export default router;
