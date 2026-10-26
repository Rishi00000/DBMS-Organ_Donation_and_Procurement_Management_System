import { query } from '../config/database.js';
import matchingService from '../services/matchingService.js';

// Get all organs
export const getAllOrgans = async (req, res, next) => {
  try {
    const {
      donor_id,
      organ_type,
      blood_type,
      is_available,
      page = 1,
      limit = 50,
    } = req.query;

    const offset = (page - 1) * limit;
    let queryText = `
      SELECT o.*, d.first_name || ' ' || d.last_name as donor_name,
             h.name as hospital_name
      FROM organs o
      JOIN donors d ON o.donor_id = d.donor_id
      JOIN hospitals h ON d.hospital_id = h.hospital_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (donor_id) {
      queryText += ` AND o.donor_id = $${paramCount}`;
      params.push(donor_id);
      paramCount++;
    }

    if (organ_type) {
      queryText += ` AND o.organ_type = $${paramCount}`;
      params.push(organ_type);
      paramCount++;
    }

    if (blood_type) {
      queryText += ` AND o.blood_type = $${paramCount}`;
      params.push(blood_type);
      paramCount++;
    }

    if (is_available !== undefined) {
      queryText += ` AND o.is_available = $${paramCount}`;
      params.push(is_available === 'true');
      paramCount++;
    }

    queryText += ` ORDER BY o.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
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

// Get available organs
export const getAvailableOrgans = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT * FROM v_available_organs
      ORDER BY procurement_date DESC
    `);

    res.json({
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// Get organ by ID
export const getOrganById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT o.*, d.first_name || ' ' || d.last_name as donor_name,
              d.hospital_id, h.name as hospital_name
       FROM organs o
       JOIN donors d ON o.donor_id = d.donor_id
       JOIN hospitals h ON d.hospital_id = h.hospital_id
       WHERE o.organ_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organ not found' });
    }

    // Get matches for this organ
    const matchesResult = await query(
      `SELECT m.*, r.first_name || ' ' || r.last_name as recipient_name,
              r.urgency_level, r.blood_type as recipient_blood_type
       FROM matches m
       JOIN recipients r ON m.recipient_id = r.recipient_id
       WHERE m.organ_id = $1
       ORDER BY m.compatibility_score DESC`,
      [id]
    );

    res.json({
      data: {
        ...result.rows[0],
        matches: matchesResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create new organ and trigger matching
export const createOrgan = async (req, res, next) => {
  try {
    const organData = req.body;

    // Validate required fields
    if (!organData.donor_id || !organData.organ_type || !organData.blood_type) {
      return res.status(400).json({ 
        error: 'Missing required fields: donor_id, organ_type, and blood_type are required' 
      });
    }

    // Convert procurement_date to proper timestamp format
    let procurementDate;
    if (organData.procurement_date) {
      // If it's a date string (YYYY-MM-DD), convert to timestamp at start of day
      if (typeof organData.procurement_date === 'string' && organData.procurement_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        procurementDate = new Date(organData.procurement_date + 'T00:00:00');
      } else {
        procurementDate = new Date(organData.procurement_date);
      }
    } else {
      procurementDate = new Date();
    }

    // Convert expiry_time to proper timestamp format
    let expiryTime = null;
    if (organData.expiry_time) {
      // If it's a datetime-local string (YYYY-MM-DDTHH:mm), convert to timestamp
      if (typeof organData.expiry_time === 'string') {
        expiryTime = new Date(organData.expiry_time);
      } else {
        expiryTime = new Date(organData.expiry_time);
      }
      
      // Validate expiry_time is after procurement_date
      if (expiryTime <= procurementDate) {
        return res.status(400).json({ 
          error: 'Expiry time must be after procurement date' 
        });
      }
    }

    console.log('📝 Creating organ with data:', {
      donor_id: organData.donor_id,
      organ_type: organData.organ_type,
      procurement_date: procurementDate,
      expiry_time: expiryTime,
      blood_type: organData.blood_type
    });

    const result = await query(
      `INSERT INTO organs (
        donor_id, organ_type, is_available, procurement_date,
        expiry_time, blood_type, hla_typing, organ_condition
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        organData.donor_id,
        organData.organ_type,
        true,
        procurementDate,
        expiryTime,
        organData.blood_type,
        organData.hla_typing || null,
        organData.organ_condition || null,
      ]
    );

    const organ = result.rows[0];

    // Trigger matching algorithm
    console.log('🎯 Triggering organ matching algorithm...');
    const matches = await matchingService.findMatches(organ.organ_id);

    res.status(201).json({
      message: 'Organ registered and matching completed',
      data: {
        organ,
        matches_found: matches.length,
        top_matches: matches.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update organ
export const updateOrgan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = [
      'is_available',
      'expiry_time',
      'organ_condition',
      'hla_typing',
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
    const queryText = `UPDATE organs SET ${setClause.join(', ')} WHERE organ_id = $${paramCount} RETURNING *`;

    const result = await query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organ not found' });
    }

    res.json({
      message: 'Organ updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// Delete organ
export const deleteOrgan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM organs WHERE organ_id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organ not found' });
    }

    res.json({
      message: 'Organ deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Manually trigger matching for an organ
export const triggerMatching = async (req, res, next) => {
  try {
    const { id } = req.params;

    const matches = await matchingService.findMatches(id);

    res.json({
      message: 'Matching completed',
      data: {
        matches_found: matches.length,
        matches,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllOrgans,
  getAvailableOrgans,
  getOrganById,
  createOrgan,
  updateOrgan,
  deleteOrgan,
  triggerMatching,
};
