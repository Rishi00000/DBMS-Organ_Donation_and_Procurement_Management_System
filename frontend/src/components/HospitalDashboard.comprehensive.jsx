import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ============================================
// DONOR REGISTRATION FORM
// ============================================
const DonorRegistrationForm = ({ hospitalId, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    bloodType: 'O+',
    hlaTyping: '',
    medicalHistory: '',
    causeOfDeath: '',
    weightKg: '',
    heightCm: '',
    donorType: 'deceased', // 'living' or 'deceased'
    consentSigned: true,
    consentDate: new Date().toISOString().split('T')[0],
    organs: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const organTypes = [
    { id: 'heart', name: 'Heart', icon: '❤️' },
    { id: 'kidney', name: 'Kidney', icon: '🫘' },
    { id: 'liver', name: 'Liver', icon: '🫀' },
    { id: 'lung', name: 'Lung', icon: '🫁' },
    { id: 'pancreas', name: 'Pancreas', icon: '🧬' },
    { id: 'intestine', name: 'Intestine', icon: '🦠' },
    { id: 'cornea', name: 'Cornea', icon: '👁️' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOrganToggle = (organId) => {
    setFormData(prev => ({
      ...prev,
      organs: prev.organs.includes(organId)
        ? prev.organs.filter(o => o !== organId)
        : [...prev.organs, organId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Convert camelCase to snake_case for backend
      const requestData = {
        hospital_id: hospitalId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        blood_type: formData.bloodType,
        hla_typing: formData.hlaTyping || null,
        weight_kg: formData.weightKg ? parseFloat(formData.weightKg) : null,
        height_cm: formData.heightCm ? parseFloat(formData.heightCm) : null,
        medical_history: formData.medicalHistory || null,
        is_living: formData.donorType === 'living',
        consent_signed: formData.consentSigned,
        consent_date: formData.consentDate,
        date_of_death: formData.donorType === 'deceased' && formData.causeOfDeath ? new Date().toISOString().split('T')[0] : null
      };
      
      await axios.post(
        'http://localhost:3000/api/donors',
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: 'male',
          bloodType: 'O+',
          hlaTyping: '',
          medicalHistory: '',
          causeOfDeath: '',
          weightKg: '',
          heightCm: '',
          donorType: 'deceased',
          consentSigned: true,
          consentDate: new Date().toISOString().split('T')[0],
          organs: []
        });
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      console.error('Donor registration error:', err.response?.data);
      const errorMsg = err.response?.data?.error || 'Failed to register donor';
      const details = err.response?.data?.details;
      
      if (details && Array.isArray(details)) {
        // Show validation errors
        const validationErrors = details.map(d => d.msg).join(', ');
        setError(`${errorMsg}: ${validationErrors}`);
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    form: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '40px',
      borderRadius: '24px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    section: {
      marginBottom: '32px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '16px',
      paddingBottom: '8px',
      borderBottom: '2px solid #e5e7eb'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      marginBottom: '16px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: '#ffffff',
      color: '#111827'
    },
    select: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: '#ffffff',
      color: '#111827'
    },
    textarea: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '80px',
      fontFamily: 'inherit',
      resize: 'vertical',
      backgroundColor: '#ffffff',
      color: '#111827'
    },
    organGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px'
    },
    organCard: {
      padding: '12px',
      border: '2px solid #d1d5db',
      borderRadius: '8px',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.2s'
    },
    organCardSelected: {
      borderColor: '#3b82f6',
      backgroundColor: '#eff6ff'
    },
    button: {
      padding: '12px 24px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '16px'
    },
    successMsg: {
      padding: '12px',
      backgroundColor: '#d1fae5',
      color: '#065f46',
      borderRadius: '8px',
      marginBottom: '16px'
    },
    errorMsg: {
      padding: '12px',
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      borderRadius: '8px',
      marginBottom: '16px'
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {success && (
        <div style={styles.successMsg}>
          ✅ Donor registered successfully!
        </div>
      )}
      {error && (
        <div style={styles.errorMsg}>
          ⚠️ {error}
        </div>
      )}

      {/* Personal Information */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Personal Information</h3>
        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Date of Birth *</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Medical Information</h3>
        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Blood Type *</label>
            <select
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              style={styles.select}
              required
            >
              {bloodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>HLA Typing (e.g., A1,A2;B7,B8;DR1,DR2)</label>
            <input
              type="text"
              name="hlaTyping"
              value={formData.hlaTyping}
              onChange={handleChange}
              style={styles.input}
              placeholder="Format: A1,A2;B7,B8;DR1,DR2"
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Weight (kg)</label>
            <input
              type="number"
              name="weightKg"
              value={formData.weightKg}
              onChange={handleChange}
              style={styles.input}
              step="0.1"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Height (cm)</label>
            <input
              type="number"
              name="heightCm"
              value={formData.heightCm}
              onChange={handleChange}
              style={styles.input}
              step="0.1"
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Medical History</label>
          <textarea
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleChange}
            style={styles.textarea}
            placeholder="Enter relevant medical history..."
          />
        </div>
      </div>

      {/* Donor Status */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Donor Status</h3>
        <div style={styles.formGroup}>
          <label style={styles.label}>Donor Type *</label>
          <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="donorType"
                value="deceased"
                checked={formData.donorType === 'deceased'}
                onChange={handleChange}
              />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Deceased Donor</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="donorType"
                value="living"
                checked={formData.donorType === 'living'}
                onChange={handleChange}
              />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Living Donor</span>
            </label>
          </div>
        </div>

        {formData.donorType === 'deceased' && (
          <div style={{ ...styles.formGroup, marginTop: '16px' }}>
            <label style={styles.label}>Cause of Death</label>
            <input
              type="text"
              name="causeOfDeath"
              value={formData.causeOfDeath}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g., Brain death, Cardiac arrest"
            />
          </div>
        )}

        <div style={{ marginTop: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              name="consentSigned"
              checked={formData.consentSigned}
              onChange={handleChange}
              required
            />
            <span style={styles.label}>Consent Form Signed *</span>
          </label>
        </div>

        <div style={{ ...styles.formGroup, marginTop: '12px' }}>
          <label style={styles.label}>Consent Date *</label>
          <input
            type="date"
            name="consentDate"
            value={formData.consentDate}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>
      </div>

      {/* Organs for Donation */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Organs for Donation *</h3>
        <div style={styles.organGrid}>
          {organTypes.map(organ => (
            <div
              key={organ.id}
              style={{
                ...styles.organCard,
                ...(formData.organs.includes(organ.id) ? styles.organCardSelected : {})
              }}
              onClick={() => handleOrganToggle(organ.id)}
            >
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                {organ.icon}
              </div>
              <div style={{ fontSize: '12px', fontWeight: '500', textTransform: 'capitalize' }}>
                {organ.name}
              </div>
            </div>
          ))}
        </div>
        {formData.organs.length === 0 && (
          <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>
            Please select at least one organ
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || formData.organs.length === 0}
        style={{
          ...styles.button,
          ...(loading || formData.organs.length === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {})
        }}
      >
        {loading ? 'Registering...' : 'Register Donor'}
      </button>
    </form>
  );
};

// ============================================
// RECIPIENT REGISTRATION FORM
// ============================================
const RecipientRegistrationForm = ({ hospitalId, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    bloodType: 'O+',
    hlaTyping: '',
    medicalCondition: '',
    urgencyLevel: 'standard',
    requiredOrgans: [],
    weightKg: '',
    heightCm: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    // Patient account credentials
    patientUsername: '',
    patientPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const organTypes = ['heart', 'kidney', 'liver', 'lung', 'pancreas', 'intestine', 'cornea'];
  const urgencyLevels = [
    { value: 'critical', label: '🔴 Critical', description: 'Life-threatening, immediate need' },
    { value: 'urgent', label: '🟡 Urgent', description: 'Serious condition, priority needed' },
    { value: 'standard', label: '🟢 Standard', description: 'Stable condition, routine priority' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOrganToggle = (organ) => {
    setFormData(prev => ({
      ...prev,
      requiredOrgans: prev.requiredOrgans.includes(organ)
        ? prev.requiredOrgans.filter(o => o !== organ)
        : [...prev.requiredOrgans, organ]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.requiredOrgans.length === 0) {
      setError('Please select at least one required organ');
      return;
    }

    if (formData.patientPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.patientPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Convert to backend format
      const requestData = {
        hospital_id: hospitalId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        blood_type: formData.bloodType,
        hla_typing: formData.hlaTyping || null,
        weight_kg: formData.weightKg ? parseFloat(formData.weightKg) : null,
        height_cm: formData.heightCm ? parseFloat(formData.heightCm) : null,
        medical_condition: formData.medicalCondition,
        urgency_level: formData.urgencyLevel,
        required_organs: formData.requiredOrgans, // Array of organs
        phone: formData.phone,
        email: formData.email || null,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postalCode || null,
        // Patient account credentials
        patient_username: formData.patientUsername,
        patient_password: formData.patientPassword
      };
      
      await axios.post(
        'http://localhost:3000/api/recipients',
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: 'male',
          bloodType: 'O+',
          hlaTyping: '',
          medicalCondition: '',
          urgencyLevel: 'standard',
          requiredOrgans: [],
          weightKg: '',
          heightCm: '',
          phone: '',
          email: '',
          address: '',
          city: '',
          state: '',
          postalCode: '',
          patientUsername: '',
          patientPassword: '',
          confirmPassword: ''
        });
        if (onSuccess) onSuccess();
      }, 3000);
    } catch (err) {
      console.error('Recipient registration error:', err.response?.data);
      const errorMsg = err.response?.data?.error || 'Failed to register recipient';
      const details = err.response?.data?.details;
      
      if (details && Array.isArray(details)) {
        const validationErrors = details.map(d => d.msg).join(', ');
        setError(`${errorMsg}: ${validationErrors}`);
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    form: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '40px',
      borderRadius: '24px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    section: {
      marginBottom: '32px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '16px',
      paddingBottom: '8px',
      borderBottom: '2px solid #e5e7eb'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      marginBottom: '16px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: '#ffffff',
      color: '#111827'
    },
    select: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: '#ffffff',
      color: '#111827'
    },
    textarea: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '80px',
      fontFamily: 'inherit',
      resize: 'vertical',
      backgroundColor: '#ffffff',
      color: '#111827'
    },
    urgencyCard: {
      padding: '16px',
      border: '2px solid #d1d5db',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginBottom: '12px'
    },
    urgencyCardSelected: {
      borderColor: '#3b82f6',
      backgroundColor: '#eff6ff'
    },
    organGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px'
    },
    organCard: {
      padding: '12px',
      border: '2px solid #d1d5db',
      borderRadius: '8px',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.2s'
    },
    organCardSelected: {
      borderColor: '#10b981',
      backgroundColor: '#d1fae5'
    },
    button: {
      padding: '12px 24px',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '16px'
    },
    successMsg: {
      padding: '12px',
      backgroundColor: '#d1fae5',
      color: '#065f46',
      borderRadius: '8px',
      marginBottom: '16px'
    },
    errorMsg: {
      padding: '12px',
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      borderRadius: '8px',
      marginBottom: '16px'
    },
    infoBox: {
      padding: '12px',
      backgroundColor: '#dbeafe',
      border: '1px solid #93c5fd',
      borderRadius: '8px',
      fontSize: '14px',
      color: '#1e40af',
      marginBottom: '16px'
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {success && (
        <div style={styles.successMsg}>
          ✅ Recipient registered successfully! Patient account created. They can now login to the Patient Portal.
        </div>
      )}
      {error && (
        <div style={styles.errorMsg}>
          ⚠️ {error}
        </div>
      )}

      <div style={styles.infoBox}>
        ℹ️ This form will register a patient on the organ transplant waitlist and automatically create their patient portal account.
      </div>

      {/* Personal Information */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Personal Information</h3>
        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Date of Birth *</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Medical Information</h3>
        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Blood Type *</label>
            <select
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              style={styles.select}
              required
            >
              {bloodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>HLA Typing (if known)</label>
            <input
              type="text"
              name="hlaTyping"
              value={formData.hlaTyping}
              onChange={handleChange}
              style={styles.input}
              placeholder="Format: A1,A2;B7,B8;DR1,DR2"
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Weight (kg)</label>
            <input
              type="number"
              name="weightKg"
              value={formData.weightKg}
              onChange={handleChange}
              style={styles.input}
              step="0.1"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Height (cm)</label>
            <input
              type="number"
              name="heightCm"
              value={formData.heightCm}
              onChange={handleChange}
              style={styles.input}
              step="0.1"
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Medical Condition *</label>
          <textarea
            name="medicalCondition"
            value={formData.medicalCondition}
            onChange={handleChange}
            style={styles.textarea}
            placeholder="Describe the patient's medical condition and why transplant is needed..."
            required
          />
        </div>
      </div>

      {/* Urgency Level */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Urgency Level *</h3>
        {urgencyLevels.map(level => (
          <div
            key={level.value}
            style={{
              ...styles.urgencyCard,
              ...(formData.urgencyLevel === level.value ? styles.urgencyCardSelected : {})
            }}
            onClick={() => setFormData(prev => ({ ...prev, urgencyLevel: level.value }))}
          >
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
              {level.label}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>
              {level.description}
            </div>
          </div>
        ))}
      </div>

      {/* Required Organs */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Required Organs *</h3>
        <div style={styles.organGrid}>
          {organTypes.map(organ => (
            <div
              key={organ}
              style={{
                ...styles.organCard,
                ...(formData.requiredOrgans.includes(organ) ? styles.organCardSelected : {})
              }}
              onClick={() => handleOrganToggle(organ)}
            >
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                {organ === 'heart' && '❤️'}
                {organ === 'kidney' && '🫘'}
                {organ === 'liver' && '🫀'}
                {organ === 'lung' && '🫁'}
                {organ === 'pancreas' && '🧬'}
                {organ === 'intestine' && '🦠'}
                {organ === 'cornea' && '👁️'}
              </div>
              <div style={{ fontSize: '12px', fontWeight: '500', textTransform: 'capitalize' }}>
                {organ}
              </div>
            </div>
          ))}
        </div>
        {formData.requiredOrgans.length === 0 && (
          <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>
            Please select at least one required organ
          </p>
        )}
      </div>

      {/* Contact Information */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Contact Information</h3>
        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
              placeholder="+911234567890"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email (optional)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="patient@example.com"
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Address *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>State *</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Postal Code</label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
      </div>

      {/* Patient Portal Account */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Patient Portal Login Credentials</h3>
        <div style={styles.infoBox}>
          🔐 These credentials will allow the patient to login to their portal and view their waitlist status.
        </div>
        
        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username *</label>
            <input
              type="text"
              name="patientUsername"
              value={formData.patientUsername}
              onChange={handleChange}
              style={styles.input}
              placeholder="Choose a unique username"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password *</label>
            <input
              type="password"
              name="patientPassword"
              value={formData.patientPassword}
              onChange={handleChange}
              style={styles.input}
              placeholder="Min 6 characters"
              required
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Confirm Password *</label>
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

      <button
        type="submit"
        disabled={loading || formData.requiredOrgans.length === 0}
        style={{
          ...styles.button,
          ...(loading || formData.requiredOrgans.length === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {})
        }}
      >
        {loading ? 'Registering...' : 'Register Recipient & Create Account'}
      </button>
    </form>
  );
};

// ============================================
// ORGAN MANAGEMENT COMPONENT
// ============================================
const OrganManagement = ({ hospitalId }) => {
  const [donors, setDonors] = useState([]);
  const [organs, setOrgans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    donor_id: '',
    organ_type: '',
    blood_type: '',
    hla_typing: '',
    procurement_date: new Date().toISOString().split('T')[0],
    expiry_time: '',
    organ_condition: 'good'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (hospitalId) {
      fetchData();
    } else {
      setLoading(false);
      setError('Hospital ID not available. Please refresh the page.');
    }
  }, [hospitalId]);

  const fetchData = async () => {
    if (!hospitalId) {
      setError('Hospital ID not available');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const [donorsRes, organsRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/donors?hospital_id=${hospitalId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:3000/api/organs`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setDonors(donorsRes.data.data || []);
      
      // Filter organs to only show those from this hospital's donors
      const allOrgans = organsRes.data.data || [];
      const hospitalDonorIds = (donorsRes.data.data || []).map(d => d.donor_id);
      const filteredOrgans = allOrgans.filter(o => hospitalDonorIds.includes(o.donor_id));
      setOrgans(filteredOrgans);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrgan = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const donor = donors.find(d => d.donor_id === parseInt(formData.donor_id));
      
      const organData = {
        donor_id: formData.donor_id,
        organ_type: formData.organ_type,
        blood_type: donor.blood_type,
        hla_typing: formData.hla_typing || donor.hla_typing || null,
        procurement_date: formData.procurement_date,
        expiry_time: formData.expiry_time || null,
        organ_condition: formData.organ_condition
      };

      const response = await axios.post(
        'http://localhost:3000/api/organs',
        organData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`Organ registered! ${response.data.data.matches_found} compatible recipients found.`);
      setShowCreateForm(false);
      setFormData({
        donor_id: '',
        organ_type: '',
        blood_type: '',
        hla_typing: '',
        procurement_date: new Date().toISOString().split('T')[0],
        expiry_time: '',
        organ_condition: 'good'
      });
      fetchData();
    } catch (err) {
      console.error('❌ Error registering organ:', err);
      console.error('❌ Error response:', err.response?.data);
      
      // Get detailed error message
      let errorMessage = 'Failed to register organ';
      if (err.response?.data) {
        errorMessage = err.response.data.message || err.response.data.error || errorMessage;
        // If there's a detail field, append it
        if (err.response.data.detail) {
          errorMessage += ': ' + err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const organTypes = [
    { id: 'heart', name: 'Heart', icon: '❤️' },
    { id: 'kidney', name: 'Kidney', icon: '🫘' },
    { id: 'liver', name: 'Liver', icon: '🫀' },
    { id: 'lung', name: 'Lung', icon: '🫁' },
    { id: 'pancreas', name: 'Pancreas', icon: '🧬' },
    { id: 'intestine', name: 'Intestine', icon: '🦠' },
    { id: 'cornea', name: 'Cornea', icon: '👁️' }
  ];

  const styles = {
    container: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '32px',
      borderRadius: '24px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
    },
    section: {
      marginBottom: '32px'
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '16px'
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '16px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '16px'
    },
    th: {
      padding: '12px',
      textAlign: 'left',
      backgroundColor: '#f3f4f6',
      borderBottom: '2px solid #e5e7eb',
      fontWeight: '600',
      color: '#374151'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #e5e7eb',
      color: '#111827'
    },
    form: {
      background: '#f9fafb',
      padding: '24px',
      borderRadius: '12px',
      marginTop: '16px'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '6px'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px'
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px'
    },
    successMsg: {
      padding: '12px',
      backgroundColor: '#d1fae5',
      color: '#065f46',
      borderRadius: '8px',
      marginBottom: '16px'
    },
    errorMsg: {
      padding: '12px',
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      borderRadius: '8px',
      marginBottom: '16px'
    }
  };

  if (loading) return <div style={{ color: '#ffffff' }}>Loading...</div>;

  return (
    <div style={styles.container}>
      {success && <div style={styles.successMsg}>✅ {success}</div>}
      {error && <div style={styles.errorMsg}>⚠️ {error}</div>}

      <div style={styles.section}>
        <h3 style={styles.title}>Available Organs</h3>
        <button style={styles.button} onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : '+ Register New Organ'}
        </button>

        {showCreateForm && (
          <form style={styles.form} onSubmit={handleCreateOrgan}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Donor *</label>
              <select
                style={styles.select}
                value={formData.donor_id}
                onChange={(e) => {
                  const donor = donors.find(d => d.donor_id === parseInt(e.target.value));
                  setFormData({
                    ...formData,
                    donor_id: e.target.value,
                    blood_type: donor?.blood_type || ''
                  });
                }}
                required
              >
                <option value="">Select a donor...</option>
                {donors
                  .filter(d => d.status === 'registered' || d.status === 'available')
                  .map(donor => (
                    <option key={donor.donor_id} value={donor.donor_id}>
                      {donor.first_name} {donor.last_name} - {donor.blood_type} {donor.is_living ? '(Living)' : '(Deceased)'}
                    </option>
                  ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Organ Type *</label>
              <select
                style={styles.select}
                value={formData.organ_type}
                onChange={(e) => setFormData({ ...formData, organ_type: e.target.value })}
                required
              >
                <option value="">Select organ type...</option>
                {organTypes.map(organ => (
                  <option key={organ.id} value={organ.id}>
                    {organ.icon} {organ.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>HLA Typing</label>
              <input
                type="text"
                style={styles.input}
                value={formData.hla_typing}
                onChange={(e) => setFormData({ ...formData, hla_typing: e.target.value })}
                placeholder="e.g., A1,A2;B7,B8;DR1,DR2"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Procurement Date *</label>
              <input
                type="date"
                style={styles.input}
                value={formData.procurement_date}
                onChange={(e) => setFormData({ ...formData, procurement_date: e.target.value })}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Expiry Time (Optional)</label>
              <input
                type="datetime-local"
                style={styles.input}
                value={formData.expiry_time}
                onChange={(e) => setFormData({ ...formData, expiry_time: e.target.value })}
              />
            </div>

            <button type="submit" style={styles.button}>
              Register Organ & Trigger Matching
            </button>
          </form>
        )}

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Organ Type</th>
              <th style={styles.th}>Donor</th>
              <th style={styles.th}>Blood Type</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Procurement Date</th>
            </tr>
          </thead>
          <tbody>
            {organs
              .filter(o => {
                const donor = donors.find(d => d.donor_id === o.donor_id);
                return donor?.hospital_id === hospitalId;
              })
              .map(organ => {
                const donor = donors.find(d => d.donor_id === organ.donor_id);
                return (
                  <tr key={organ.organ_id}>
                    <td style={styles.td}>
                      {organTypes.find(o => o.id === organ.organ_type)?.icon} {organ.organ_type}
                    </td>
                    <td style={styles.td}>
                      {donor ? `${donor.first_name} ${donor.last_name}` : 'Unknown'}
                    </td>
                    <td style={styles.td}>{organ.blood_type}</td>
                    <td style={styles.td}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: organ.is_available ? '#d1fae5' : '#fee2e2',
                        color: organ.is_available ? '#065f46' : '#991b1b',
                        fontSize: '12px'
                      }}>
                        {organ.is_available ? 'Available' : 'Allocated'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(organ.procurement_date).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================
// WAITLIST VIEW COMPONENT
// ============================================
const WaitlistView = ({ hospitalId }) => {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ urgency_level: '', status: '' });

  useEffect(() => {
    if (hospitalId) {
      fetchRecipients();
    } else {
      setLoading(false);
    }
  }, [hospitalId]);

  const fetchRecipients = async () => {
    if (!hospitalId) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/recipients?hospital_id=${hospitalId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecipients(response.data.data || []);
    } catch (err) {
      console.error('Error fetching recipients:', err);
      setRecipients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (recipientId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/recipients/${recipientId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      fetchRecipients();
    } catch (err) {
      alert('Failed to update recipient: ' + (err.response?.data?.error || err.message));
    }
  };

  const urgencyColors = {
    critical: { bg: '#fee2e2', color: '#991b1b', label: '🔴 Critical' },
    urgent: { bg: '#fef3c7', color: '#92400e', label: '🟡 Urgent' },
    standard: { bg: '#d1fae5', color: '#065f46', label: '🟢 Standard' }
  };

  const statusColors = {
    active: { bg: '#dbeafe', color: '#1e40af' },
    inactive: { bg: '#e5e7eb', color: '#4b5563' },
    matched: { bg: '#fef3c7', color: '#92400e' },
    transplanted: { bg: '#d1fae5', color: '#065f46' }
  };

  const styles = {
    container: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '32px',
      borderRadius: '24px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '16px'
    },
    th: {
      padding: '12px',
      textAlign: 'left',
      backgroundColor: '#f3f4f6',
      borderBottom: '2px solid #e5e7eb',
      fontWeight: '600',
      color: '#374151'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #e5e7eb',
      color: '#111827'
    },
    button: {
      padding: '6px 12px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      marginRight: '8px'
    },
    select: {
      padding: '6px 8px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '12px',
      marginRight: '8px'
    }
  };

  if (loading) return <div style={{ color: '#ffffff' }}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
        Recipients on Waitlist ({recipients.length})
      </h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Patient Name</th>
            <th style={styles.th}>Required Organ</th>
            <th style={styles.th}>Blood Type</th>
            <th style={styles.th}>Urgency</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Days Waiting</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {recipients.map(recipient => (
            <tr key={recipient.recipient_id}>
              <td style={styles.td}>
                {recipient.first_name} {recipient.last_name}
              </td>
              <td style={styles.td}>{recipient.required_organ}</td>
              <td style={styles.td}>{recipient.blood_type}</td>
              <td style={styles.td}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: urgencyColors[recipient.urgency_level]?.bg || '#e5e7eb',
                  color: urgencyColors[recipient.urgency_level]?.color || '#4b5563',
                  fontSize: '12px'
                }}>
                  {urgencyColors[recipient.urgency_level]?.label || recipient.urgency_level}
                </span>
              </td>
              <td style={styles.td}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: statusColors[recipient.status]?.bg || '#e5e7eb',
                  color: statusColors[recipient.status]?.color || '#4b5563',
                  fontSize: '12px'
                }}>
                  {recipient.status}
                </span>
              </td>
              <td style={styles.td}>{recipient.days_on_waitlist || 0} days</td>
              <td style={styles.td}>
                {editingId === recipient.recipient_id ? (
                  <>
                    <select
                      style={styles.select}
                      value={formData.urgency_level || recipient.urgency_level}
                      onChange={(e) => setFormData({ ...formData, urgency_level: e.target.value })}
                    >
                      <option value="critical">Critical</option>
                      <option value="urgent">Urgent</option>
                      <option value="standard">Standard</option>
                    </select>
                    <select
                      style={styles.select}
                      value={formData.status || recipient.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <button style={styles.button} onClick={() => handleUpdate(recipient.recipient_id)}>
                      Save
                    </button>
                    <button style={{ ...styles.button, backgroundColor: '#6b7280' }} onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button style={styles.button} onClick={() => {
                    setEditingId(recipient.recipient_id);
                    setFormData({ urgency_level: recipient.urgency_level, status: recipient.status });
                  }}>
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================
// MATCHING SYSTEM COMPONENT
// ============================================
const MatchingSystem = ({ hospitalId }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    if (hospitalId) {
      fetchMatches();
    } else {
      setLoading(false);
      setError('Hospital ID not available');
    }
  }, [hospitalId]);

  const fetchMatches = async () => {
    if (!hospitalId) {
      setError('Hospital ID not available');
      setLoading(false);
      return;
    }

    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:3000/api/matches?status=pending',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Filter matches for recipients from this hospital
      // The API now includes recipient_hospital_id in the response
      const allMatches = response.data.data || [];
      
      // Filter to only show matches for recipients from this hospital
      const filteredMatches = allMatches.filter(m => 
        m.recipient_hospital_id === hospitalId || m.recipientHospitalId === hospitalId
      );
      setMatches(filteredMatches);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to load matches: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (matchId) => {
    if (!confirm('Accept this match and proceed to transplant?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:3000/api/matches/${matchId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Match accepted! Transplant scheduled. Patient will be notified via email.');
      fetchMatches();
    } catch (err) {
      alert('Failed to accept match: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleReject = async (matchId) => {
    const reason = prompt('Enter reason for rejection:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:3000/api/matches/${matchId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Match rejected.');
      fetchMatches();
    } catch (err) {
      alert('Failed to reject match: ' + (err.response?.data?.error || err.message));
    }
  };

  const styles = {
    container: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '32px',
      borderRadius: '24px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
    },
    matchCard: {
      background: '#f9fafb',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '16px',
      border: '2px solid #e5e7eb'
    },
    score: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#10b981',
      marginBottom: '8px'
    },
    button: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      marginRight: '8px',
      marginTop: '8px'
    },
    acceptButton: {
      backgroundColor: '#10b981',
      color: 'white'
    },
    rejectButton: {
      backgroundColor: '#ef4444',
      color: 'white'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>
          Loading matches...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ 
          color: '#991b1b', 
          backgroundColor: '#fee2e2', 
          padding: '16px', 
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          ⚠️ {error}
        </div>
        <button
          onClick={fetchMatches}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
        Available Matches for Your Patients ({matches.length})
      </h3>
      {matches.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No pending matches found for your hospital's patients.</p>
      ) : (
        matches.map(match => {
          // Safely handle all properties
          const compatibilityScore = match.compatibility_score 
            ? (typeof match.compatibility_score === 'number' 
                ? match.compatibility_score.toFixed(2) 
                : parseFloat(match.compatibility_score || 0).toFixed(2))
            : 'N/A';
          
          const distance = match.geographic_distance_km 
            ? (typeof match.geographic_distance_km === 'number' 
                ? match.geographic_distance_km.toFixed(2) 
                : parseFloat(match.geographic_distance_km || 0).toFixed(2))
            : null;

          return (
            <div key={match.match_id || Math.random()} style={styles.matchCard}>
              <div style={styles.score}>Compatibility Score: {compatibilityScore}</div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Patient:</strong> {match.recipient_name || 'Unknown'} 
                {' '}(Blood: {match.recipient_blood_type || 'N/A'}, 
                Urgency: {match.urgency_level || 'N/A'})
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Organ:</strong> {match.organ_type || 'N/A'} 
                {' '}(Blood: {match.organ_blood_type || 'N/A'})
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>HLA Match Score:</strong> {match.hla_match_score || 'N/A'} / 12
              </div>
              {distance && (
                <div style={{ marginBottom: '8px' }}>
                  <strong>Distance:</strong> {distance} km
                </div>
              )}
              <div>
                <button
                  style={{ ...styles.button, ...styles.acceptButton }}
                  onClick={() => handleAccept(match.match_id)}
                >
                  ✅ Accept Match
                </button>
                <button
                  style={{ ...styles.button, ...styles.rejectButton }}
                  onClick={() => handleReject(match.match_id)}
                >
                  ❌ Reject Match
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

// ============================================
// TRANSPLANT LOG COMPONENT
// ============================================
const TransplantLog = ({ hospitalId }) => {
  const [transplants, setTransplants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ status: '', outcome_notes: '', complications: '' });

  useEffect(() => {
    fetchTransplants();
  }, [hospitalId]);

  const fetchTransplants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/transplants?hospital_id=${hospitalId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTransplants(response.data.data || []);
    } catch (err) {
      console.error('Error fetching transplants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (transplantId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/transplants/${transplantId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      fetchTransplants();
    } catch (err) {
      alert('Failed to update transplant: ' + (err.response?.data?.error || err.message));
    }
  };

  const statusColors = {
    scheduled: { bg: '#dbeafe', color: '#1e40af' },
    'in-progress': { bg: '#fef3c7', color: '#92400e' },
    successful: { bg: '#d1fae5', color: '#065f46' },
    failed: { bg: '#fee2e2', color: '#991b1b' }
  };

  const styles = {
    container: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '32px',
      borderRadius: '24px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '16px'
    },
    th: {
      padding: '12px',
      textAlign: 'left',
      backgroundColor: '#f3f4f6',
      borderBottom: '2px solid #e5e7eb',
      fontWeight: '600',
      color: '#374151'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #e5e7eb',
      color: '#111827'
    },
    button: {
      padding: '6px 12px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px'
    },
    textarea: {
      width: '100%',
      padding: '8px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '12px',
      marginBottom: '8px'
    }
  };

  if (loading) return <div style={{ color: '#ffffff' }}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
        Transplant Records ({transplants.length})
      </h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Organ</th>
            <th style={styles.th}>Recipient</th>
            <th style={styles.th}>Surgery Date</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transplants.map(transplant => (
            <tr key={transplant.transplant_id}>
              <td style={styles.td}>{transplant.organ_type}</td>
              <td style={styles.td}>{transplant.recipient_name}</td>
              <td style={styles.td}>
                {transplant.surgery_date ? new Date(transplant.surgery_date).toLocaleDateString() : 'TBD'}
              </td>
              <td style={styles.td}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: statusColors[transplant.status]?.bg || '#e5e7eb',
                  color: statusColors[transplant.status]?.color || '#4b5563',
                  fontSize: '12px'
                }}>
                  {transplant.status}
                </span>
              </td>
              <td style={styles.td}>
                {editingId === transplant.transplant_id ? (
                  <div>
                    <select
                      style={{ ...styles.button, marginBottom: '8px', display: 'block' }}
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in-progress">In Progress</option>
                      <option value="successful">Successful</option>
                      <option value="failed">Failed</option>
                    </select>
                    <textarea
                      style={styles.textarea}
                      placeholder="Outcome notes..."
                      value={formData.outcome_notes}
                      onChange={(e) => setFormData({ ...formData, outcome_notes: e.target.value })}
                    />
                    <textarea
                      style={styles.textarea}
                      placeholder="Complications (if any)..."
                      value={formData.complications}
                      onChange={(e) => setFormData({ ...formData, complications: e.target.value })}
                    />
                    <button style={styles.button} onClick={() => handleUpdate(transplant.transplant_id)}>
                      Save
                    </button>
                    <button style={{ ...styles.button, backgroundColor: '#6b7280', marginLeft: '8px' }} onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button style={styles.button} onClick={() => {
                    setEditingId(transplant.transplant_id);
                    setFormData({
                      status: transplant.status,
                      outcome_notes: transplant.outcome_notes || '',
                      complications: transplant.complications || ''
                    });
                  }}>
                    Update Status
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================
// MAIN HOSPITAL DASHBOARD
// ============================================
const HospitalDashboardComprehensive = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitalInfo();
  }, []);

  const fetchHospitalInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch the hospital ID for the current user from hospital_staff table
      const response = await axios.get('http://localhost:3000/api/hospitals/my-hospital', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.data) {
        const hospital = response.data.data;
        setHospitalInfo({ id: hospital.hospital_id, name: hospital.name });
      } else {
        throw new Error('No hospital found for this user');
      }
    } catch (error) {
      console.error('Error fetching hospital info:', error);
      // Try fallback to get all hospitals
      try {
        const fallbackResponse = await axios.get('http://localhost:3000/api/hospitals', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (fallbackResponse.data.data && fallbackResponse.data.data.length > 0) {
          const hospital = fallbackResponse.data.data[0];
          setHospitalInfo({ id: hospital.hospital_id, name: hospital.name });
        } else {
          throw new Error('No hospitals found');
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setError('Failed to load hospital information. Please contact support.');
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '\'Inter\', system-ui, -apple-system, sans-serif'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '20px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255, 255, 255, 0.3)'
    },
    nav: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      padding: '0 40px',
      display: 'flex',
      gap: '4px',
      overflowX: 'auto',
      margin: '24px 40px',
      borderRadius: '16px'
    },
    navItem: {
      padding: '18px 24px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      color: '#64748b',
      whiteSpace: 'nowrap',
      transition: 'all 0.3s ease',
      borderRadius: '12px',
      position: 'relative'
    },
    navItemActive: {
      color: '#fff',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
    },
    content: {
      padding: '40px',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    pageTitle: {
      fontSize: '32px',
      fontWeight: '800',
      color: '#ffffff',
      marginBottom: '32px',
      letterSpacing: '-0.5px',
      textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
    },
    dashboardText: {
      color: '#ffffff',
      fontSize: '16px',
      lineHeight: '1.6',
      textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
    },
    logoutButton: {
      padding: '10px 24px',
      background: 'linear-gradient(135deg, #f43f5e 0%, #ef4444 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
      transition: 'all 0.3s ease',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(239, 68, 68, 0.4)'
      }
    }
  };

  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'register-donor', label: '🩸 Register Donor', icon: '🩸' },
    { id: 'register-recipient', label: '🧑‍⚕️ Register Recipient', icon: '🧑‍⚕️' },
    { id: 'organs', label: '🫀 Organ Management', icon: '🫀' },
    { id: 'waitlist', label: '📋 Waitlist', icon: '📋' },
    { id: 'matching', label: '🎯 Matching', icon: '🎯' },
    { id: 'transplants', label: '✅ Transplants', icon: '✅' }
  ];

  if (loading) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ color: '#ffffff', fontSize: '18px', textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)' }}>
          Loading hospital information...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>
          🏥 Hospital Portal
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            {user?.username}
          </span>
          <button
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <nav style={styles.nav}>
        {menuItems.map((item) => (
          <div
            key={item.id}
            style={{
              ...styles.navItem,
              ...(currentView === item.id ? styles.navItemActive : {})
            }}
            onClick={() => setCurrentView(item.id)}
          >
            {item.label}
          </div>
        ))}
      </nav>

      <div style={styles.content}>
        {!hospitalInfo && !loading && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            padding: '20px', 
            borderRadius: '12px', 
            color: '#ffffff',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p>⚠️ Unable to load hospital information.</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              This may happen if your account is not linked to a hospital.
            </p>
            <button
              onClick={fetchHospitalInfo}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {currentView === 'dashboard' && (
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.dashboardText}>
              Welcome to your Hospital Portal! Use the navigation above to access different modules.
            </p>
            {hospitalInfo && (
              <p style={{ ...styles.dashboardText, marginTop: '16px', fontSize: '14px' }}>
                Hospital: <strong>{hospitalInfo.name}</strong> (ID: {hospitalInfo.id})
              </p>
            )}
          </div>
        )}

        {currentView === 'register-donor' && (
          <div style={{ minHeight: '100vh' }}>
            <h1 style={styles.pageTitle}>Register New Donor</h1>
            {hospitalInfo ? (
              <DonorRegistrationForm 
                hospitalId={hospitalInfo.id}
                onSuccess={() => alert('Donor registered successfully!')}
              />
            ) : (
              <div style={{ color: '#ffffff', padding: '20px' }}>Loading...</div>
            )}
          </div>
        )}

        {currentView === 'register-recipient' && (
          <div>
            <h1 style={styles.pageTitle}>Register New Recipient</h1>
            <RecipientRegistrationForm 
              hospitalId={hospitalInfo?.id}
              onSuccess={() => alert('Recipient registered successfully! Patient account created.')}
            />
          </div>
        )}

        {currentView === 'organs' && (
          <div>
            <h1 style={styles.pageTitle}>Organ Management</h1>
            {hospitalInfo ? (
              <OrganManagement hospitalId={hospitalInfo.id} />
            ) : (
              <div style={{ color: '#ffffff', padding: '20px' }}>
                Loading hospital information... Please wait.
              </div>
            )}
          </div>
        )}

        {currentView === 'waitlist' && (
          <div>
            <h1 style={styles.pageTitle}>Waitlist Management</h1>
            {hospitalInfo ? (
              <WaitlistView hospitalId={hospitalInfo.id} />
            ) : (
              <div style={{ color: '#ffffff', padding: '20px' }}>
                Loading hospital information... Please wait.
              </div>
            )}
          </div>
        )}

        {currentView === 'matching' && (
          <div>
            <h1 style={styles.pageTitle}>Organ Matching System</h1>
            {hospitalInfo && <MatchingSystem hospitalId={hospitalInfo.id} />}
          </div>
        )}

        {currentView === 'transplants' && (
          <div>
            <h1 style={styles.pageTitle}>Transplant Records</h1>
            {hospitalInfo && <TransplantLog hospitalId={hospitalInfo.id} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboardComprehensive;
