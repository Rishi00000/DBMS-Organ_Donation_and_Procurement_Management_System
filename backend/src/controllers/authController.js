import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// User registration
export const register = async (req, res, next) => {
  try {
    const { username, email, password, role, additionalInfo } = req.body;

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const userResult = await query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, username, email, role, created_at`,
      [username, email, password_hash, role]
    );

    const user = userResult.rows[0];

    // If hospital staff, create hospital_staff record
    if (role === 'hospital_staff' && additionalInfo) {
      await query(
        `INSERT INTO hospital_staff (
          user_id, hospital_id, first_name, last_name, 
          designation, license_number, phone
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          user.user_id,
          additionalInfo.hospital_id,
          additionalInfo.first_name,
          additionalInfo.last_name,
          additionalInfo.designation,
          additionalInfo.license_number,
          additionalInfo.phone,
        ]
      );
    }

    // Generate token
    const token = generateToken(user.user_id, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// User login
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find user
    const result = await query(
      `SELECT user_id, username, email, password_hash, role, is_active 
       FROM users 
       WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    // Generate token
    const token = generateToken(user.user_id, user.role);

    // Get additional info based on role
    let additionalData = {};
    if (user.role === 'hospital_staff') {
      const staffResult = await query(
        `SELECT hs.*, h.name as hospital_name 
         FROM hospital_staff hs
         JOIN hospitals h ON hs.hospital_id = h.hospital_id
         WHERE hs.user_id = $1`,
        [user.user_id]
      );
      if (staffResult.rows.length > 0) {
        additionalData = staffResult.rows[0];
      }
    } else if (user.role === 'recipient') {
      const recipientResult = await query(
        'SELECT recipient_id, first_name, last_name, status FROM recipients WHERE user_id = $1',
        [user.user_id]
      );
      if (recipientResult.rows.length > 0) {
        additionalData = recipientResult.rows[0];
      }
    }

    res.json({
      message: 'Login successful',
      data: {
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role,
          ...additionalData,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const result = await query(
      `SELECT user_id, username, email, role, is_active, created_at, last_login
       FROM users 
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Get role-specific details
    let roleDetails = {};
    if (user.role === 'hospital_staff') {
      const staffResult = await query(
        `SELECT hs.*, h.name as hospital_name, h.city, h.state
         FROM hospital_staff hs
         JOIN hospitals h ON hs.hospital_id = h.hospital_id
         WHERE hs.user_id = $1`,
        [userId]
      );
      if (staffResult.rows.length > 0) {
        roleDetails = staffResult.rows[0];
      }
    } else if (user.role === 'recipient') {
      const recipientResult = await query(
        `SELECT r.*, h.name as hospital_name
         FROM recipients r
         JOIN hospitals h ON r.hospital_id = h.hospital_id
         WHERE r.user_id = $1`,
        [userId]
      );
      if (recipientResult.rows.length > 0) {
        roleDetails = recipientResult.rows[0];
      }
    }

    res.json({
      data: {
        ...user,
        ...roleDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { currentPassword, newPassword } = req.body;

    // Get current password hash
    const result = await query(
      'SELECT password_hash FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [newPasswordHash, userId]
    );

    res.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  getProfile,
  changePassword,
};
