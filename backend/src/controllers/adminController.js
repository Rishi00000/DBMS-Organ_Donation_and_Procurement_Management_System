import { query } from '../config/database.js';

// Get system dashboard statistics
export const getDashboardStats = async (req, res, next) => {
  try {
    const statsResult = await query('SELECT * FROM v_system_stats');

    const additionalStats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE is_active = true) as active_users,
        (SELECT COUNT(*) FROM organs WHERE is_available = true 
         AND (expiry_time IS NULL OR expiry_time > CURRENT_TIMESTAMP)) as available_organs_valid,
        (SELECT AVG(CURRENT_DATE - waitlist_date) FROM recipients WHERE status = 'active') as avg_wait_time_days
    `);

    res.json({
      data: {
        ...statsResult.rows[0],
        ...additionalStats.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, is_active } = req.query;

    let queryText = 'SELECT user_id, username, email, role, is_active, created_at, last_login FROM users WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (role) {
      queryText += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    if (is_active !== undefined) {
      queryText += ` AND is_active = $${paramCount}`;
      params.push(is_active === 'true');
      paramCount++;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Deactivate user
export const deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'UPDATE users SET is_active = false WHERE user_id = $1 RETURNING user_id, username, is_active',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deactivated successfully', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Activate user
export const activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'UPDATE users SET is_active = true WHERE user_id = $1 RETURNING user_id, username, is_active',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User activated successfully', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Get audit logs
export const getAuditLogs = async (req, res, next) => {
  try {
    const { user_id, action, table_name, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT al.*, u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (user_id) {
      queryText += ` AND al.user_id = $${paramCount}`;
      params.push(user_id);
      paramCount++;
    }

    if (action) {
      queryText += ` AND al.action = $${paramCount}`;
      params.push(action);
      paramCount++;
    }

    if (table_name) {
      queryText += ` AND al.table_name = $${paramCount}`;
      params.push(table_name);
      paramCount++;
    }

    queryText += ` ORDER BY al.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Generate report
export const generateReport = async (req, res, next) => {
  try {
    const { report_type, start_date, end_date } = req.query;

    let reportData = {};

    switch (report_type) {
      case 'transplants':
        const transplantReport = await query(
          `SELECT 
            DATE(surgery_date) as date,
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'successful') as successful
           FROM transplants
           WHERE surgery_date BETWEEN $1 AND $2
           GROUP BY DATE(surgery_date)
           ORDER BY date DESC`,
          [start_date, end_date]
        );
        reportData = transplantReport.rows;
        break;

      case 'waitlist':
        const waitlistReport = await query(
          `SELECT required_organ, urgency_level, COUNT(*) as count,
                  AVG(CURRENT_DATE - waitlist_date) as avg_days
           FROM recipients
           WHERE status = 'active'
           GROUP BY required_organ, urgency_level
           ORDER BY required_organ, urgency_level`
        );
        reportData = waitlistReport.rows;
        break;

      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    res.json({ data: reportData });
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardStats,
  getAllUsers,
  deactivateUser,
  activateUser,
  getAuditLogs,
  generateReport,
};
