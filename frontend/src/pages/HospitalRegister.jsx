import React, { useState } from 'react';
import axios from 'axios';

const HospitalRegister = ({ onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    hospitalName: '',
    registrationNumber: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create axios instance without default Authorization header for public endpoint
      const publicAxios = axios.create({
        baseURL: 'http://localhost:3000',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      await publicAxios.post('/api/hospitals/register', {
        name: formData.hospitalName,
        registrationNumber: formData.registrationNumber,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        phone: formData.phone,
        email: formData.email,
        username: formData.username,
        password: formData.password
      });
      
      setSuccess(true);
      setFormData({
        hospitalName: '',
        registrationNumber: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        phone: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    card: {
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      overflow: 'hidden'
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px',
      textAlign: 'center',
      color: 'white'
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
    successMessage: {
      backgroundColor: '#d1fae5',
      border: '2px solid #10b981',
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center'
    },
    successTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#065f46',
      marginBottom: '12px'
    },
    successText: {
      fontSize: '16px',
      color: '#047857',
      lineHeight: '1.6'
    },
    backButton: {
      marginTop: '20px',
      padding: '12px 24px',
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
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
    required: {
      color: '#ef4444',
      marginLeft: '4px'
    },
    input: {
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    textarea: {
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '16px',
      outline: 'none',
      minHeight: '80px',
      resize: 'vertical',
      fontFamily: 'inherit'
    },
    error: {
      backgroundColor: '#fee2e2',
      border: '2px solid #ef4444',
      color: '#991b1b',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px'
    },
    submitButton: {
      padding: '16px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '18px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    submitButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏥</div>
            <h1 style={styles.title}>Registration Successful!</h1>
          </div>
          <div style={styles.body}>
            <div style={styles.successMessage}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
              <h2 style={styles.successTitle}>Thank You for Registering!</h2>
              <p style={styles.successText}>
                Your hospital registration request has been submitted successfully.<br /><br />
                <strong>Important:</strong> Your application is now pending admin approval.<br />
                You will be notified via email once the admin reviews and approves your registration.<br /><br />
                Please check your email regularly for updates.
              </p>
              <button
                style={styles.backButton}
                onClick={onNavigateToLogin}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏥</div>
          <h1 style={styles.title}>Hospital Registration</h1>
          <p style={styles.subtitle}>Join the ODPMS Network</p>
        </div>
        
        <div style={styles.body}>
          {error && <div style={styles.error}>⚠️ {error}</div>}
          
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Hospital Information */}
            <div>
              <h3 style={{ marginBottom: '16px', color: '#111827' }}>Hospital Information</h3>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Hospital Name<span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter hospital name"
                  required
                />
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <div style={styles.row}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Registration Number<span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="e.g., HRN12345"
                      required
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Phone Number<span style={styles.required}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="+91XXXXXXXXXX"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 style={{ marginBottom: '16px', color: '#111827' }}>Address</h3>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Address<span style={styles.required}>*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  style={styles.textarea}
                  placeholder="Enter complete address"
                  required
                />
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <div style={styles.row}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      City<span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Enter city"
                      required
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      State<span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Enter state"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Postal Code<span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Enter postal code"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Login Credentials */}
            <div>
              <h3 style={{ marginBottom: '16px', color: '#111827' }}>Login Credentials</h3>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Email (Username)<span style={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="email@hospital.com"
                  required
                />
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Username<span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <div style={styles.row}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Password<span style={styles.required}>*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Min. 6 characters"
                      required
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Confirm Password<span style={styles.required}>*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Re-enter password"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {})
              }}
              onMouseOver={(e) => !loading && (e.target.style.transform = 'scale(1.02)')}
              onMouseOut={(e) => !loading && (e.target.style.transform = 'scale(1)')}
            >
              {loading ? 'Submitting...' : 'Register Hospital'}
            </button>
            
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
              Already registered? <span onClick={onNavigateToLogin} style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600', cursor: 'pointer' }}>Login here</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HospitalRegister;
