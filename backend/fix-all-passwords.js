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

async function fixAllPasswords() {
  try {
    const users = [
      { username: 'admin', password: 'admin123' },
      { username: 'apollo_staff1', password: 'staff123' },
      { username: 'fortis_staff1', password: 'staff123' },
      { username: 'aiims_staff1', password: 'staff123' },
      { username: 'patient_arjun', password: 'patient123' },
      { username: 'patient_kavita', password: 'patient123' },
      { username: 'patient_suresh', password: 'patient123' },
    ];

    console.log('🔧 Fixing passwords for all demo users...\n');

    for (const { username, password } of users) {
      const hash = await bcrypt.hash(password, 10);
      
      const result = await pool.query(
        'UPDATE users SET password_hash = $1 WHERE username = $2 RETURNING username, role',
        [hash, username]
      );
      
      if (result.rowCount > 0) {
        const user = result.rows[0];
        
        // Verify the password
        const verification = await pool.query(
          'SELECT password_hash FROM users WHERE username = $1',
          [username]
        );
        
        const isMatch = await bcrypt.compare(password, verification.rows[0].password_hash);
        const status = isMatch ? '✅' : '❌';
        
        console.log(`${status} ${username.padEnd(20)} | ${user.role.padEnd(15)} | ${password}`);
      } else {
        console.log(`⚠️  ${username} - not found`);
      }
    }
    
    console.log('\n✅ All passwords updated successfully!');
    console.log('\n📝 You can now login with these credentials:');
    console.log('   Admin:          admin / admin123');
    console.log('   Hospital Staff: apollo_staff1 / staff123');
    console.log('   Recipient:      patient_arjun / patient123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

fixAllPasswords();
