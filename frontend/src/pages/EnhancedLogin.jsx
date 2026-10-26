import React, { useState } from 'react';
import axios from 'axios';

const EnhancedLogin = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: 'admin', label: 'Admin', icon: '👨‍💼', color: '#ef4444' },
    { id: 'hospital', label: 'Hospital Staff', icon: '🏥', color: '#3b82f6' },
    { id: 'patient', label: 'Patient', icon: '🧑‍⚕️', color: '#10b981' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Trim whitespace from inputs
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    // Validate inputs are not empty
    if (!trimmedUsername || !trimmedPassword) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    console.log('🔐 Login attempt:', { username: trimmedUsername, role: selectedRole });

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        username: trimmedUsername,
        password: trimmedPassword,
        roleType: selectedRole // Send the selected role type
      });

      console.log('📦 Response received:', response.data);

      // Check if response has data
      if (!response.data || !response.data.data) {
        setError('Invalid response from server');
        setLoading(false);
        return;
      }

      const { user, token } = response.data.data;
      
      // Validate user and token exist
      if (!user || !token) {
        setError('Invalid response data from server');
        setLoading(false);
        return;
      }
      
      // Validate role matches
      if (selectedRole === 'admin' && user.role !== 'admin') {
        setError('Invalid admin credentials');
        setLoading(false);
        return;
      }
      
      if (selectedRole === 'hospital' && user.role !== 'hospital_staff') {
        setError('Invalid hospital staff credentials');
        setLoading(false);
        return;
      }
      
      if (selectedRole === 'patient' && user.role !== 'recipient') {
        setError('Invalid patient credentials');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('✅ Login successful:', user);
      onLoginSuccess(user);
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error details:', error.response?.data);
      
      // Better error message handling
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Unable to connect to server. Please check if the backend is running.';
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      maxWidth: '500px',
      width: '100%',
      overflow: 'hidden'
    },
    header: {
      backgroundColor: '#667eea',
      padding: '40px',
      textAlign: 'center',
      color: 'white'
    },
    logo: {
      fontSize: '64px',
      marginBottom: '16px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '16px',
      opacity: 0.9
    },
    body: {
      padding: '40px'
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#6b7280',
      marginBottom: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    roleGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      marginBottom: '32px'
    },
    roleCard: {
      padding: '20px 12px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s',
      backgroundColor: 'white'
    },
    roleCardActive: {
      borderColor: '#667eea',
      backgroundColor: '#eff6ff',
      transform: 'scale(1.05)',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
    },
    roleIcon: {
      fontSize: '32px',
      marginBottom: '8px'
    },
    roleLabel: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#374151'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151'
    },
    input: {
      padding: '14px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    error: {
      backgroundColor: '#fee2e2',
      border: '2px solid #ef4444',
      color: '#991b1b',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '16px'
    },
    button: {
      padding: '16px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '18px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      marginTop: '8px'
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '24px 0',
      color: '#9ca3af',
      fontSize: '14px'
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      backgroundColor: '#e5e7eb'
    },
    dividerText: {
      padding: '0 16px'
    },
    registerLink: {
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#f9fafb',
      borderTop: '1px solid #e5e7eb'
    },
    registerText: {
      fontSize: '14px',
      color: '#6b7280'
    },
    registerButton: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '600',
      marginLeft: '4px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>🏥</div>
          <h1 style={styles.title}>ODPMS</h1>
          <p style={styles.subtitle}>Organ Donation & Procurement Management</p>
        </div>

        <div style={styles.body}>
          <p style={styles.sectionTitle}>Select Your Role</p>
          <div style={styles.roleGrid}>
            {roles.map((role) => (
              <div
                key={role.id}
                style={{
                  ...styles.roleCard,
                  ...(selectedRole === role.id ? styles.roleCardActive : {})
                }}
                onClick={() => setSelectedRole(role.id)}
              >
                <div style={styles.roleIcon}>{role.icon}</div>
                <div style={styles.roleLabel}>{role.label}</div>
              </div>
            ))}
          </div>

          {error && <div style={styles.error}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                placeholder="Enter your username"
                required
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="Enter your password"
                required
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {})
              }}
              onMouseOver={(e) => !loading && (e.target.style.transform = 'scale(1.02)')}
              onMouseOut={(e) => !loading && (e.target.style.transform = 'scale(1)')}
            >
              {loading ? 'Logging in...' : `Login as ${roles.find(r => r.id === selectedRole)?.label}`}
            </button>
          </form>

          {/* Demo Credentials Section */}
          {selectedRole !== 'patient' && (
            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '13px', color: '#6b7280' }}>
              <strong>Demo Credentials:</strong><br />
              {selectedRole === 'admin' && (
                <span style={{ display: 'block', marginTop: '8px' }}>
                  Admin: <strong>admin</strong> / <strong>admin123</strong>
                </span>
              )}
              {selectedRole === 'hospital' && (
                <span style={{ display: 'block', marginTop: '8px' }}>
                  Hospital: <strong>apollo_staff1</strong> / <strong>staff123</strong>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Register Hospital Link */}
        <div style={styles.registerLink}>
          <p style={styles.registerText}>
            New Hospital?
            <span 
              onClick={onNavigateToRegister}
              style={{...styles.registerButton, cursor: 'pointer'}}
            >
              Register Here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLogin;
