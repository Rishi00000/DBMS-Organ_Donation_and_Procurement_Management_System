import { query } from '../config/database.js';

// Get all donors
export const getAllDonors = async (req, res, next) => {
  try {
    const {
      hospital_id,
      blood_type,
      status,
      is_living,
      page = 1,
      limit = 50,
    } = req.query;

    const offset = (page - 1) * limit;
    let queryText = `
      SELECT d.*, h.name as hospital_name 
      FROM donors d
      JOIN hospitals h ON d.hospital_id = h.hospital_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    // Apply filters
    if (hospital_id) {
      queryText += ` AND d.hospital_id = $${paramCount}`;
      params.push(hospital_id);
      paramCount++;
    }

    if (blood_type) {
      queryText += ` AND d.blood_type = $${paramCount}`;
      params.push(blood_type);
      paramCount++;
    }

    if (status) {
      queryText += ` AND d.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (is_living !== undefined) {
      queryText += ` AND d.is_living = $${paramCount}`;
      params.push(is_living === 'true');
      paramCount++;
    }

    // Authorization: Hospital staff can only see their hospital's donors
    if (req.user.role === 'hospital_staff' && req.userHospitalId) {
      queryText += ` AND d.hospital_id = $${paramCount}`;
      params.push(req.userHospitalId);
      paramCount++;
    }

    queryText += ` ORDER BY d.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
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

// Get donor by ID
export const getDonorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT d.*, h.name as hospital_name, h.city, h.state,
              u.username as registered_by_username
       FROM donors d
       JOIN hospitals h ON d.hospital_id = h.hospital_id
       JOIN users u ON d.registered_by = u.user_id
       WHERE d.donor_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    // Check authorization
    if (req.user.role === 'hospital_staff' && req.userHospitalId) {
      if (result.rows[0].hospital_id !== req.userHospitalId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Get donor's organs
    const organsResult = await query(
      'SELECT * FROM organs WHERE donor_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({
      data: {
        ...result.rows[0],
        organs: organsResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create new donor
export const createDonor = async (req, res, next) => {
  try {
    const donorData = req.body;
    const userId = req.user.user_id;

    // Use user's hospital ID if not provided (for security)
    let hospitalId = donorData.hospital_id;
    if (req.user.role === 'hospital_staff' && req.userHospitalId) {
      if (!hospitalId) {
        hospitalId = req.userHospitalId;
      } else if (hospitalId !== req.userHospitalId) {
        // Hospital staff can only create donors for their own hospital
        return res.status(403).json({ error: 'You can only create donors for your own hospital' });
      }
    }

    if (!hospitalId) {
      return res.status(400).json({ error: 'Hospital ID is required' });
    }

    console.log('Creating donor with data:', { ...donorData, hospital_id: hospitalId });

    const result = await query(
      `INSERT INTO donors (
        hospital_id, registered_by, first_name, last_name, date_of_birth,
        gender, blood_type, hla_typing, weight_kg, height_cm, medical_history,
        phone, email, address, city, state, is_living, consent_signed,
        consent_date, status, date_of_death
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        hospitalId,
        userId,
        donorData.first_name,
        donorData.last_name,
        donorData.date_of_birth,
        donorData.gender,
        donorData.blood_type,
        donorData.hla_typing || null,
        donorData.weight_kg || null,
        donorData.height_cm || null,
        donorData.medical_history || null,
        donorData.phone || null,
        donorData.email || null,
        donorData.address || null,
        donorData.city || null,
        donorData.state || null,
        donorData.is_living || false,
        donorData.consent_signed || false,
        donorData.consent_date || null,
        donorData.status || 'registered',
        donorData.date_of_death || null,
      ]
    );

    const newDonor = result.rows[0];
    console.log('✅ Donor created successfully:', newDonor.donor_id);

    res.status(201).json({
      message: 'Donor registered successfully',
      data: newDonor,
    });
  } catch (error) {
    console.error('Error creating donor:', error);
    next(error);
  }
};

// Update donor
export const updateDonor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = [
      'status',
      'phone',
      'email',
      'address',
      'city',
      'state',
      'hla_typing',
      'weight_kg',
      'height_cm',
      'medical_history',
      'date_of_death',
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
    const queryText = `UPDATE donors SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                       WHERE donor_id = $${paramCount} RETURNING *`;

    const result = await query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    res.json({
      message: 'Donor updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// Delete donor
export const deleteDonor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM donors WHERE donor_id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    res.json({
      message: 'Donor deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllDonors,
  getDonorById,
  createDonor,
  updateDonor,
  deleteDonor,
};
