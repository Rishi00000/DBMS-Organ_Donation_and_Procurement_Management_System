import { query } from '../config/database.js';

// Get all transplants
export const getAllTransplants = async (req, res, next) => {
  try {
    const { status, hospital_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT t.*, o.organ_type,
             d.first_name || ' ' || d.last_name as donor_name,
             r.first_name || ' ' || r.last_name as recipient_name,
             h.name as hospital_name
      FROM transplants t
      JOIN organs o ON t.organ_id = o.organ_id
      JOIN donors d ON t.donor_id = d.donor_id
      JOIN recipients r ON t.recipient_id = r.recipient_id
      JOIN hospitals h ON t.hospital_id = h.hospital_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND t.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (hospital_id) {
      queryText += ` AND t.hospital_id = $${paramCount}`;
      params.push(hospital_id);
      paramCount++;
    }

    if (req.user.role === 'hospital_staff' && req.userHospitalId) {
      queryText += ` AND t.hospital_id = $${paramCount}`;
      params.push(req.userHospitalId);
      paramCount++;
    }

    queryText += ` ORDER BY t.surgery_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Get transplant by ID
export const getTransplantById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT t.*, o.organ_type,
              d.first_name || ' ' || d.last_name as donor_name,
              r.first_name || ' ' || r.last_name as recipient_name,
              h.name as hospital_name
       FROM transplants t
       JOIN organs o ON t.organ_id = o.organ_id
       JOIN donors d ON t.donor_id = d.donor_id
       JOIN recipients r ON t.recipient_id = r.recipient_id
       JOIN hospitals h ON t.hospital_id = h.hospital_id
       WHERE t.transplant_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transplant not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Update transplant status
export const updateTransplantStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, outcome_notes, complications } = req.body;

    const result = await query(
      `UPDATE transplants 
       SET status = $1, outcome_notes = $2, complications = $3,
           completion_date = CASE WHEN $1 IN ('successful', 'failed') THEN CURRENT_TIMESTAMP ELSE completion_date END,
           updated_at = CURRENT_TIMESTAMP
       WHERE transplant_id = $4 RETURNING *`,
      [status, outcome_notes, complications, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transplant not found' });
    }

    if (status === 'successful') {
      await query(`UPDATE recipients SET status = 'transplanted' WHERE recipient_id = $1`, 
        [result.rows[0].recipient_id]);
    }

    res.json({ message: 'Transplant updated successfully', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllTransplants,
  getTransplantById,
  updateTransplantStatus,
};
