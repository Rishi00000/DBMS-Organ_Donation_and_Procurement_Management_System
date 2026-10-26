import { body, param, query, validationResult } from 'express-validator';

// Validation result handler
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['admin', 'hospital_staff', 'recipient'])
    .withMessage('Invalid role'),
  validate,
];

export const validateLogin = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// Hospital validation rules
export const validateHospital = [
  body('name').trim().notEmpty().withMessage('Hospital name is required'),
  body('registration_number').trim().notEmpty().withMessage('Registration number is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('postal_code').trim().notEmpty().withMessage('Postal code is required'),
  body('phone').trim().matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number'),
  body('email').trim().isEmail().withMessage('Invalid email address'),
  validate,
];

// Donor validation rules
export const validateDonor = [
  body('hospital_id').isInt({ min: 1 }).withMessage('Valid hospital ID is required'),
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('date_of_birth').isDate().withMessage('Valid date of birth is required'),
  body('gender').trim().notEmpty().withMessage('Gender is required'),
  body('blood_type')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood type'),
  body('is_living').isBoolean().withMessage('Living status must be boolean'),
  body('consent_signed').isBoolean().withMessage('Consent status must be boolean'),
  validate,
];

// Recipient validation rules (updated for patient account creation)
export const validateRecipient = [
  body('hospital_id').isInt({ min: 1 }).withMessage('Valid hospital ID is required'),
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('date_of_birth').isDate().withMessage('Valid date of birth is required'),
  body('gender').trim().notEmpty().withMessage('Gender is required'),
  body('blood_type')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood type'),
  body('urgency_level')
    .isIn(['critical', 'urgent', 'standard'])
    .withMessage('Invalid urgency level'),
  body('medical_condition').trim().notEmpty().withMessage('Medical condition is required'),
  body('phone').trim().matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  // Patient account credentials
  body('patient_username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('patient_password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
];

// Organ validation rules
export const validateOrgan = [
  body('donor_id').isInt({ min: 1 }).withMessage('Valid donor ID is required'),
  body('organ_type')
    .isIn(['heart', 'kidney', 'liver', 'lung', 'pancreas', 'intestine', 'cornea'])
    .withMessage('Invalid organ type'),
  body('blood_type')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood type'),
  validate,
];

// Transplant validation rules
export const validateTransplant = [
  body('match_id').isInt({ min: 1 }).withMessage('Valid match ID is required'),
  body('surgery_date').isISO8601().withMessage('Valid surgery date is required'),
  body('hospital_id').isInt({ min: 1 }).withMessage('Valid hospital ID is required'),
  validate,
];

// ID parameter validation
export const validateId = [
  param('id').isInt({ min: 1 }).withMessage('Invalid ID parameter'),
  validate,
];

// Query parameter validation
export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate,
];

export default {
  validate,
  validateUserRegistration,
  validateLogin,
  validateHospital,
  validateDonor,
  validateRecipient,
  validateOrgan,
  validateTransplant,
  validateId,
  validatePagination,
};
