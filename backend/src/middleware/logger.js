import { query } from '../config/database.js';

// Audit logger middleware
export const auditLogger = (action, tableName) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
      res.send = originalSend;

      // Log only successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user ? req.user.user_id : null;
        const recordId = req.params.id || req.body.id || null;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // Parse response data if it's JSON
        let newValues = null;
        try {
          const responseData = JSON.parse(data);
          if (responseData.data) {
            newValues = responseData.data;
          }
        } catch (e) {
          // Not JSON, skip
        }

        // Asynchronously log to audit table (don't block response)
        query(
          `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [userId, action, tableName, recordId, newValues, ipAddress, userAgent]
        ).catch(err => {
          console.error('Audit logging error:', err);
        });
      }

      return res.send(data);
    };

    next();
  };
};

// Request logger middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      user: req.user ? req.user.username : 'anonymous',
    };
    
    console.log(JSON.stringify(logData));
  });

  next();
};

export default {
  auditLogger,
  requestLogger,
};
