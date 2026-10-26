import { query } from '../config/database.js';
import pool from '../config/database.js';
import bcrypt from 'bcrypt';

// Get all recipients
export const getAllRecipients = async (req, res, next) => {
  try {
    const {
      hospital_id,
      blood_type,
      required_organ,
      urgency_level,
      status,
      user_id,
      page = 1,
      limit = 50,
    } = req.query;

    const offset = (page - 1) * limit;
    let queryText = `
      SELECT r.*, h.name as hospital_name,
             CURRENT_DATE - r.waitlist_date as days_on_waitlist
      FROM recipients r
      JOIN hospitals h ON r.hospital_id = h.hospital_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    // Apply filters
    if (user_id) {
      queryText += ` AND r.user_id = $${paramCount}`;
      params.push(user_id);
      paramCount++;
    }

    if (hospital_id) {
      queryText += ` AND r.hospital_id = $${paramCount}`;
      params.push(hospital_id);
      paramCount++;
    }

    if (blood_type) {
      queryText += ` AND r.blood_type = $${paramCount}`;
      params.push(blood_type);
      paramCount++;
    }

    if (required_organ) {
      queryText += ` AND r.required_organ = $${paramCount}`;
      params.push(required_organ);
      paramCount++;
    }

    if (urgency_level) {
      queryText += ` AND r.urgency_level = $${paramCount}`;
      params.push(urgency_level);
      paramCount++;
    }

    if (status) {
      queryText += ` AND r.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    // Authorization: 
    // - Recipients can only see their own data
    // - Hospital staff can only see their hospital's recipients
    if (req.user.role === 'recipient') {
      queryText += ` AND r.user_id = $${paramCount}`;
      params.push(req.user.user_id);
      paramCount++;
    } else if (req.user.role === 'hospital_staff' && req.userHospitalId) {
      queryText += ` AND r.hospital_id = $${paramCount}`;
      params.push(req.userHospitalId);
      paramCount++;
    }

    queryText += ` ORDER BY r.urgency_level DESC, r.waitlist_date ASC 
                   LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get recipient by ID
export const getRecipientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT r.*, h.name as hospital_name, h.city, h.state,
              u.username as registered_by_username,
              CURRENT_DATE - r.waitlist_date as days_on_waitlist
       FROM recipients r
       JOIN hospitals h ON r.hospital_id = h.hospital_id
       JOIN users u ON r.registered_by = u.user_id
       WHERE r.recipient_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const recipient = result.rows[0];

    // Check authorization
    if (req.user.role === 'recipient') {
      // Recipients can only see their own data
      if (recipient.user_id !== req.user.user_id) {
        return res.status(403).json({ error: 'Access denied. You can only view your own information.' });
      }
    } else if (req.user.role === 'hospital_staff' && req.userHospitalId) {
      // Hospital staff can only see their hospital's recipients
      if (recipient.hospital_id !== req.userHospitalId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Get recipient's matches
    const matchesResult = await query(
      `SELECT m.*, o.organ_type, o.blood_type
       FROM matches m
       JOIN organs o ON m.organ_id = o.organ_id
       WHERE m.recipient_id = $1
       ORDER BY m.compatibility_score DESC, m.matched_at DESC`,
      [id]
    );

    res.json({
      data: {
        ...recipient,
        matches: matchesResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create new recipient WITH patient account
export const createRecipient = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    const recipientData = req.body;
    const registeredBy = req.user.user_id;

    // Use user's hospital ID if not provided (for security)
    let hospitalId = recipientData.hospital_id;
    if (req.user.role === 'hospital_staff' && req.userHospitalId) {
      if (!hospitalId) {
        hospitalId = req.userHospitalId;
      } else if (hospitalId !== req.userHospitalId) {
        // Hospital staff can only create recipients for their own hospital
        return res.status(403).json({ error: 'You can only create recipients for your own hospital' });
      }
    }

    if (!hospitalId) {
      return res.status(400).json({ error: 'Hospital ID is required' });
    }

    console.log('Creating recipient with data:', { ...recipientData, hospital_id: hospitalId });

    await client.query('BEGIN');

    // Step 1: Create patient user account
    const hashedPassword = await bcrypt.hash(recipientData.patient_password, 10);
    
    const userResult = await client.query(
      `INSERT INTO users (username, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, 'recipient', true)
       RETURNING user_id, username, email, role`,
      [recipientData.patient_username, recipientData.email, hashedPassword]
    );

    const newUser = userResult.rows[0];
    console.log('✅ Patient user account created:', newUser.user_id);

    // Step 2: Register recipient (use only first organ for required_organ field)
    const primaryOrgan = Array.isArray(recipientData.required_organs) && recipientData.required_organs.length > 0
      ? recipientData.required_organs[0]
      : recipientData.required_organ;

    const recipientResult = await client.query(
      `INSERT INTO recipients (
        user_id, hospital_id, registered_by, first_name, last_name,
        date_of_birth, gender, blood_type, required_organ, hla_typing,
        urgency_level, medical_condition, weight_kg, height_cm,
        phone, email, address, city, state, waitlist_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        newUser.user_id,
        hospitalId,
        registeredBy,
        recipientData.first_name,
        recipientData.last_name,
        recipientData.date_of_birth,
        recipientData.gender,
        recipientData.blood_type,
        primaryOrgan,
        recipientData.hla_typing || null,
        recipientData.urgency_level || 'standard',
        recipientData.medical_condition,
        recipientData.weight_kg || null,
        recipientData.height_cm || null,
        recipientData.phone,
        recipientData.email || null,
        recipientData.address,
        recipientData.city,
        recipientData.state,
        new Date().toISOString().split('T')[0], // waitlist_date
        'active',
      ]
    );

    const newRecipient = recipientResult.rows[0];
    console.log('✅ Recipient registered:', newRecipient.recipient_id);

    // Step 3: Log the action
    await client.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
       VALUES ($1, 'CREATE', 'recipients', $2, $3)`,
      [registeredBy, newRecipient.recipient_id, JSON.stringify({
        name: `${newRecipient.first_name} ${newRecipient.last_name}`,
        required_organs: recipientData.required_organs || [primaryOrgan],
        urgency: recipientData.urgency_level,
        patient_account: newUser.username
      })]
    );

    await client.query('COMMIT');

    console.log(`✅ Recipient registration complete. Username: ${newUser.username}, ID: ${newRecipient.recipient_id}`);

    res.status(201).json({
      message: 'Recipient registered successfully and patient account created',
      data: {
        recipient: newRecipient,
        patientAccount: {
          username: newUser.username,
          userId: newUser.user_id
        }
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating recipient:', error);
    
    // Check for duplicate username
    if (error.code === '23505' && error.constraint === 'users_username_key') {
      return res.status(400).json({ error: 'Username already exists. Please choose a different username.' });
    }
    
    next(error);
  } finally {
    client.release();
  }
};

// Update recipient
export const updateRecipient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // First, get the recipient to check authorization
    const recipientCheck = await query(
      'SELECT user_id, hospital_id FROM recipients WHERE recipient_id = $1',
      [id]
    );

    if (recipientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const recipient = recipientCheck.rows[0];

    // Authorization checks
    if (req.user.role === 'recipient') {
      // Recipients can only update their own data and only contact information
      if (recipient.user_id !== req.user.user_id) {
        return res.status(403).json({ error: 'Access denied. You can only update your own information.' });
      }
      // Recipients can only update contact fields
      const allowedFieldsForRecipients = ['phone', 'email', 'address', 'city', 'state', 'postal_code'];
      const recipientOnlyFields = Object.keys(updates).filter(field => !allowedFieldsForRecipients.includes(field));
      if (recipientOnlyFields.length > 0) {
        return res.status(403).json({ 
          error: 'Access denied. Recipients can only update contact information.',
          restrictedFields: recipientOnlyFields
        });
      }
    } else if (req.user.role === 'hospital_staff' && req.userHospitalId) {
      // Hospital staff can only update their hospital's recipients
      if (recipient.hospital_id !== req.userHospitalId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const allowedFields = [
      'urgency_level',
      'medical_condition',
      'phone',
      'email',
      'address',
      'city',
      'state',
      'postal_code',
      'status',
      'hla_typing',
      'weight_kg',
      'height_cm',
    ];

    const setClause = [];
    const values = [];
    let paramCount = 1;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClause.push(`${field} = $${paramCount}`);
        values.push(updates[field]);
        paramCount++;
      }
    }

    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);
    const queryText = `UPDATE recipients SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                       WHERE recipient_id = $${paramCount} RETURNING *`;

    const result = await query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    res.json({
      message: 'Recipient updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// Delete recipient
export const deleteRecipient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM recipients WHERE recipient_id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    res.json({
      message: 'Recipient deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get active waitlist
export const getActiveWaitlist = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT * FROM v_active_waitlist
      ORDER BY 
        CASE urgency_level 
          WHEN 'critical' THEN 1
          WHEN 'urgent' THEN 2
          ELSE 3
        END,
        days_on_waitlist DESC
    `);

    res.json({
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllRecipients,
  getRecipientById,
  createRecipient,
  updateRecipient,
  deleteRecipient,
  getActiveWaitlist,
};
