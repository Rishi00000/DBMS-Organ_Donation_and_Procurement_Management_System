import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateLogin, validateUserRegistration } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, authController.register);
router.post('/login', validateLogin, authController.login);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/change-password', authenticateToken, authController.changePassword);

export default router;
