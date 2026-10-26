import pool from '../config/database.js';
import bcrypt from 'bcrypt';

// Register a new hospital (public endpoint)
export const registerHospital = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      name,
      registrationNumber,
      address,
      city,
      state,
      postalCode,
      phone,
      email,
      username,
      password
    } = req.body;

    // Validation
    if (!name || !registrationNumber || !address || !city || !state || !postalCode || !phone || !email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    await client.query('BEGIN');

    // Check if registration number already exists
    const existingHospital = await client.query(
      'SELECT hospital_id FROM hospitals WHERE registration_number = $1',
      [registrationNumber]
    );

    if (existingHospital.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Hospital registration number already exists' });
    }

    // Check if username already exists
    const existingUser = await client.query(
      'SELECT user_id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user account (inactive until hospital is approved)
    const userResult = await client.query(
      `INSERT INTO users (username, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, 'hospital_staff', false)
       RETURNING user_id, username, email, role`,
      [username, email, passwordHash]
    );

    const user = userResult.rows[0];

    // Create hospital record with 'pending' status
    const hospitalResult = await client.query(
      `INSERT INTO hospitals 
       (name, registration_number, address, city, state, postal_code, phone, email, status, country)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', 'India')
       RETURNING hospital_id, name, registration_number, status`,
      [name, registrationNumber, address, city, state, postalCode, phone, email]
    );

    const hospital = hospitalResult.rows[0];

    // Create hospital_staff link
    await client.query(
      `INSERT INTO hospital_staff (user_id, hospital_id, first_name, last_name, designation, phone)
       VALUES ($1, $2, $3, $4, 'Hospital Administrator', $5)`,
      [user.user_id, hospital.hospital_id, 'Admin', 'User', phone]
    );

    await client.query('COMMIT');

    // Log the registration
    console.log(`✅ New hospital registered: ${name} (ID: ${hospital.hospital_id}) - Pending approval`);

    res.status(201).json({
      message: 'Hospital registration submitted successfully. Pending admin approval.',
      data: {
        hospital: {
          id: hospital.hospital_id,
          name: hospital.name,
          registrationNumber: hospital.registration_number,
          status: hospital.status
        },
        user: {
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error registering hospital:', error);
    res.status(500).json({ error: 'Failed to register hospital' });
  } finally {
    client.release();
  }
};

// Get pending hospital registrations (admin only)
export const getPendingHospitals = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        h.hospital_id,
        h.name,
        h.registration_number,
        h.address,
        h.city,
        h.state,
        h.postal_code,
        h.phone,
        h.email,
        h.status,
        h.created_at,
        u.username,
        u.email as user_email
       FROM hospitals h
       LEFT JOIN hospital_staff hs ON h.hospital_id = hs.hospital_id
       LEFT JOIN users u ON hs.user_id = u.user_id
       WHERE h.status = 'pending'
       ORDER BY h.created_at DESC`
    );

    res.json({
      message: 'Pending hospitals retrieved successfully',
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching pending hospitals:', error);
    res.status(500).json({ error: 'Failed to fetch pending hospitals' });
  }
};

// Approve hospital (admin only)
export const approveHospital = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { hospitalId } = req.params;
    const adminId = req.user.user_id;

    await client.query('BEGIN');

    // Update hospital status
    const hospitalResult = await client.query(
      `UPDATE hospitals 
       SET status = 'approved', 
           approved_at = CURRENT_TIMESTAMP, 
           approved_by = $1
       WHERE hospital_id = $2 AND status = 'pending'
       RETURNING hospital_id, name, registration_number`,
      [adminId, hospitalId]
    );

    if (hospitalResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Hospital not found or already processed' });
    }

    const hospital = hospitalResult.rows[0];

    // Activate the user account
    await client.query(
      `UPDATE users 
       SET is_active = true
       WHERE user_id IN (
         SELECT user_id FROM hospital_staff WHERE hospital_id = $1
       )`,
      [hospitalId]
    );

    // Log the action
    await client.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
       VALUES ($1, 'APPROVE', 'hospitals', $2, $3)`,
      [adminId, hospitalId, JSON.stringify({ name: hospital.name, status: 'approved' })]
    );

    await client.query('COMMIT');

    console.log(`✅ Hospital approved: ${hospital.name} (ID: ${hospital.hospital_id})`);

    res.json({
      message: 'Hospital approved successfully',
      data: hospital
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error approving hospital:', error);
    res.status(500).json({ error: 'Failed to approve hospital' });
  } finally {
    client.release();
  }
};

// Reject hospital (admin only)
export const rejectHospital = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { hospitalId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.user_id;

    await client.query('BEGIN');

    // Update hospital status
    const hospitalResult = await client.query(
      `UPDATE hospitals 
       SET status = 'rejected'
       WHERE hospital_id = $1 AND status = 'pending'
       RETURNING hospital_id, name, registration_number`,
      [hospitalId]
    );

    if (hospitalResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Hospital not found or already processed' });
    }

    const hospital = hospitalResult.rows[0];

    // Log the action
    await client.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
       VALUES ($1, 'REJECT', 'hospitals', $2, $3)`,
      [adminId, hospitalId, JSON.stringify({ name: hospital.name, status: 'rejected', reason: reason || 'No reason provided' })]
    );

    await client.query('COMMIT');

    console.log(`❌ Hospital rejected: ${hospital.name} (ID: ${hospital.hospital_id})`);

    res.json({
      message: 'Hospital rejected successfully',
      data: hospital
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error rejecting hospital:', error);
    res.status(500).json({ error: 'Failed to reject hospital' });
  } finally {
    client.release();
  }
};
