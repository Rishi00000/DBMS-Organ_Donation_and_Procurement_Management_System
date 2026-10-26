import { query } from '../config/database.js';

// Get current user's hospital (for hospital staff)
export const getMyHospital = async (req, res, next) => {
  try {
    if (req.user.role !== 'hospital_staff') {
      return res.status(403).json({ error: 'Only hospital staff can access this endpoint' });
    }

    const result = await query(
      `SELECT h.* 
       FROM hospitals h
       JOIN hospital_staff hs ON h.hospital_id = hs.hospital_id
       WHERE hs.user_id = $1`,
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hospital not found for this user' });
    }

    res.json({
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// Get all hospitals
export const getAllHospitals = async (req, res, next) => {
  try {
    // If hospital staff, return only their hospital
    if (req.user.role === 'hospital_staff' && req.userHospitalId) {
      const result = await query('SELECT * FROM hospitals WHERE hospital_id = $1', [req.userHospitalId]);
      return res.json({
        data: result.rows,
        pagination: {
          page: 1,
          limit: 1,
          total: result.rows.length,
          pages: 1,
        },
      });
    }

    // Admin can see all hospitals
    const { status, city, state, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM hospitals WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (city) {
      queryText += ` AND LOWER(city) = LOWER($${paramCount})`;
      params.push(city);
      paramCount++;
    }

    if (state) {
      queryText += ` AND LOWER(state) = LOWER($${paramCount})`;
      params.push(state);
      paramCount++;
    }

    queryText += ` ORDER BY name ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    const countResult = await query('SELECT COUNT(*) FROM hospitals WHERE 1=1');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get hospital by ID
export const getHospitalById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM hospitals WHERE hospital_id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    // Get hospital statistics
    const statsResult = await query(
      `SELECT 
        (SELECT COUNT(*) FROM donors WHERE hospital_id = $1) as total_donors,
        (SELECT COUNT(*) FROM recipients WHERE hospital_id = $1) as total_recipients,
        (SELECT COUNT(*) FROM transplants WHERE hospital_id = $1 AND status = 'successful') as successful_transplants,
        (SELECT COUNT(*) FROM hospital_staff WHERE hospital_id = $1) as total_staff
      `,
      [id]
    );

    res.json({
      data: {
        ...result.rows[0],
        statistics: statsResult.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create new hospital
export const createHospital = async (req, res, next) => {
  try {
    const {
      name,
      registration_number,
      address,
      city,
      state,
      country,
      postal_code,
      phone,
      email,
      latitude,
      longitude,
    } = req.body;

    const result = await query(
      `INSERT INTO hospitals (
        name, registration_number, address, city, state, country,
        postal_code, phone, email, latitude, longitude, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
      RETURNING *`,
      [name, registration_number, address, city, state, country || 'India', postal_code, phone, email, latitude, longitude]
    );

    res.status(201).json({
      message: 'Hospital registration submitted for approval',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// Update hospital
export const updateHospital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = [
      'name',
      'address',
      'city',
      'state',
      'postal_code',
      'phone',
      'email',
      'latitude',
      'longitude',
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
    const queryText = `UPDATE hospitals SET ${setClause.join(', ')} WHERE hospital_id = $${paramCount} RETURNING *`;

    const result = await query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    res.json({
      message: 'Hospital updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// Approve hospital (Admin only)
export const approveHospital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const result = await query(
      `UPDATE hospitals 
       SET status = 'approved', 
           approved_at = CURRENT_TIMESTAMP, 
           approved_by = $1
       WHERE hospital_id = $2
       RETURNING *`,
      [userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    res.json({
      message: 'Hospital approved successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// Reject hospital (Admin only)
export const rejectHospital = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE hospitals SET status = 'rejected' WHERE hospital_id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    res.json({
      message: 'Hospital rejected',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// Get hospital staff
export const getHospitalStaff = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT hs.*, u.username, u.email, u.is_active
       FROM hospital_staff hs
       JOIN users u ON hs.user_id = u.user_id
       WHERE hs.hospital_id = $1
       ORDER BY hs.created_at DESC`,
      [id]
    );

    res.json({
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMyHospital,
  getAllHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  approveHospital,
  rejectHospital,
  getHospitalStaff,
};
