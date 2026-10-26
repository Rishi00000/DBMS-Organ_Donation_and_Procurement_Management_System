import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

// Verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user details from database
    const result = await query(
      'SELECT user_id, username, email, role, is_active FROM users WHERE user_id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Role-based authorization middleware
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Check if user is admin
export const isAdmin = authorize('admin');

// Check if user is hospital staff
export const isHospitalStaff = authorize('hospital_staff', 'admin');

// Check if user is recipient
export const isRecipient = authorize('recipient', 'admin');

// Check if hospital staff belongs to specific hospital
export const verifyHospitalAccess = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next(); // Admins have access to all hospitals
    }

    if (req.user.role !== 'hospital_staff') {
      return res.status(403).json({ error: 'Only hospital staff can access this resource' });
    }

    // Get hospital_id from request params or body
    const hospitalId = req.params.hospitalId || req.body.hospital_id;

    if (!hospitalId) {
      return res.status(400).json({ error: 'Hospital ID is required' });
    }

    // Verify staff belongs to this hospital
    const result = await query(
      'SELECT hospital_id FROM hospital_staff WHERE user_id = $1 AND hospital_id = $2',
      [req.user.user_id, hospitalId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. You do not belong to this hospital.' });
    }

    req.hospitalId = parseInt(hospitalId);
    next();
  } catch (error) {
    console.error('Hospital access verification error:', error);
    return res.status(500).json({ error: 'Access verification failed' });
  }
};

// Get user's hospital (for hospital staff)
export const getUserHospital = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next();
    }

    if (req.user.role === 'hospital_staff') {
      const result = await query(
        'SELECT hospital_id FROM hospital_staff WHERE user_id = $1',
        [req.user.user_id]
      );

      if (result.rows.length > 0) {
        req.userHospitalId = result.rows[0].hospital_id;
      }
    }

    next();
  } catch (error) {
    console.error('Get user hospital error:', error);
    return res.status(500).json({ error: 'Failed to retrieve user hospital' });
  }
};

export default {
  authenticateToken,
  authorize,
  isAdmin,
  isHospitalStaff,
  isRecipient,
  verifyHospitalAccess,
  getUserHospital,
};
