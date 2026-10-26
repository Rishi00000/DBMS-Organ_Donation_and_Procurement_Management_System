import { query } from '../config/database.js';
import matchingService from '../services/matchingService.js';

// Get all matches
export const getAllMatches = async (req, res, next) => {
  try {
    const { status, recipient_id, organ_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT m.*,
             o.organ_type, o.blood_type as organ_blood_type,
             r.first_name || ' ' || r.last_name as recipient_name,
             r.blood_type as recipient_blood_type, r.urgency_level,
             r.hospital_id as recipient_hospital_id,
             d.first_name || ' ' || d.last_name as donor_name,
             h.name as hospital_name
      FROM matches m
      JOIN organs o ON m.organ_id = o.organ_id
      JOIN recipients r ON m.recipient_id = r.recipient_id
      JOIN donors d ON o.donor_id = d.donor_id
      JOIN hospitals h ON r.hospital_id = h.hospital_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND m.match_status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (recipient_id) {
      queryText += ` AND m.recipient_id = $${paramCount}`;
      params.push(recipient_id);
      paramCount++;
    }

    if (organ_id) {
      queryText += ` AND m.organ_id = $${paramCount}`;
      params.push(organ_id);
      paramCount++;
    }

    queryText += ` ORDER BY m.compatibility_score DESC, m.matched_at DESC 
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

// Get match by ID
export const getMatchById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT m.*,
              o.organ_type, o.blood_type as organ_blood_type, o.procurement_date,
              r.*, r.first_name || ' ' || r.last_name as recipient_name,
              d.first_name || ' ' || d.last_name as donor_name,
              h.name as hospital_name, h.phone as hospital_phone
       FROM matches m
       JOIN organs o ON m.organ_id = o.organ_id
       JOIN recipients r ON m.recipient_id = r.recipient_id
       JOIN donors d ON o.donor_id = d.donor_id
       JOIN hospitals h ON r.hospital_id = h.hospital_id
       WHERE m.match_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json({
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// Get matches for a recipient
export const getRecipientMatches = async (req, res, next) => {
  try {
    const { recipientId } = req.params;

    // Check authorization - recipients can only see their own matches
    if (req.user.role === 'recipient') {
      const recipientCheck = await query(
        'SELECT user_id FROM recipients WHERE recipient_id = $1',
        [recipientId]
      );
      
      if (recipientCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Recipient not found' });
      }

      if (recipientCheck.rows[0].user_id !== req.user.user_id) {
        return res.status(403).json({ error: 'Access denied. You can only view your own matches.' });
      }
    }

    const matches = await matchingService.getRecipientMatches(recipientId);

    res.json({
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};

// Accept a match
export const acceptMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const result = await matchingService.acceptMatch(id, userId);

    res.json({
      message: 'Match accepted successfully. Transplant scheduled.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Reject a match
export const rejectMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await matchingService.rejectMatch(id, reason || 'No reason provided');

    res.json({
      message: 'Match rejected',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get matching statistics
export const getMatchingStats = async (req, res, next) => {
  try {
    const stats = await matchingService.getMatchingStats();

    res.json({
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllMatches,
  getMatchById,
  getRecipientMatches,
  acceptMatch,
  rejectMatch,
  getMatchingStats,
};
