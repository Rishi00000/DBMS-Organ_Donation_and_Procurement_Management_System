import bcrypt from 'bcrypt';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function fixPassword() {
  try {
    // Generate hash for 'admin123'
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    
    console.log('Generated hash for password "admin123":', hash);
    
    // Update admin user
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE username = $2 RETURNING username',
      [hash, 'admin']
    );
    
    if (result.rowCount > 0) {
      console.log('✅ Admin password updated successfully!');
      
      // Test the password
      const user = await pool.query(
        'SELECT password_hash FROM users WHERE username = $1',
        ['admin']
      );
      
      const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
      console.log('✅ Password verification test:', isMatch ? 'PASSED' : 'FAILED');
    } else {
      console.log('❌ Admin user not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

fixPassword();
