import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminRecipientViewer = () => {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [recipientsRes, hospitalsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/recipients', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:3000/api/hospitals', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setRecipients(recipientsRes.data.data || []);
      setHospitals(hospitalsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipients = selectedHospital
    ? recipients.filter(r => r.hospital_id === parseInt(selectedHospital))
    : recipients;

  const urgencyColors = {
    critical: { bg: '#fee2e2', color: '#991b1b', label: '🔴 Critical' },
    urgent: { bg: '#fef3c7', color: '#92400e', label: '🟡 Urgent' },
    standard: { bg: '#d1fae5', color: '#065f46', label: '🟢 Standard' }
  };

  const statusColors = {
    active: { bg: '#dbeafe', color: '#1e40af' },
    inactive: { bg: '#e5e7eb', color: '#4b5563' },
    matched: { bg: '#fef3c7', color: '#92400e' }
  };

  const styles = {
    container: {
      padding: '32px',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#111827'
    },
    filter: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
    recipientCard: {
      background: '#f9fafb',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '16px',
      border: '2px solid #e5e7eb'
    },
    button: {
      padding: '6px 12px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px'
    }
  };

  if (loading) return <div style={{ padding: '32px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>All Recipients on Waitlist ({filteredRecipients.length})</h2>
        <select
          style={styles.filter}
          value={selectedHospital}
          onChange={(e) => setSelectedHospital(e.target.value)}
        >
          <option value="">All Hospitals</option>
          {hospitals.map(h => (
            <option key={h.hospital_id} value={h.hospital_id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      {selectedRecipient ? (
        <div>
          <button style={styles.button} onClick={() => setSelectedRecipient(null)}>
            ← Back to List
          </button>
          <div style={styles.recipientCard}>
            <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>
              {selectedRecipient.first_name} {selectedRecipient.last_name}
            </h3>
            <div style={{ marginBottom: '12px' }}>
              <strong>Hospital:</strong> {selectedRecipient.hospital_name}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Blood Type:</strong> {selectedRecipient.blood_type}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Required Organ:</strong> {selectedRecipient.required_organ}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Urgency Level:</strong>{' '}
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: urgencyColors[selectedRecipient.urgency_level]?.bg || '#e5e7eb',
                color: urgencyColors[selectedRecipient.urgency_level]?.color || '#4b5563',
                fontSize: '12px'
              }}>
                {urgencyColors[selectedRecipient.urgency_level]?.label || selectedRecipient.urgency_level}
              </span>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Status:</strong>{' '}
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: statusColors[selectedRecipient.status]?.bg || '#e5e7eb',
                color: statusColors[selectedRecipient.status]?.color || '#4b5563',
                fontSize: '12px'
              }}>
                {selectedRecipient.status}
              </span>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Medical Condition:</strong> {selectedRecipient.medical_condition || 'Not provided'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>HLA Typing:</strong> {selectedRecipient.hla_typing || 'Not provided'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Date of Birth:</strong> {new Date(selectedRecipient.date_of_birth).toLocaleDateString()}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Gender:</strong> {selectedRecipient.gender}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Waitlist Date:</strong> {new Date(selectedRecipient.waitlist_date).toLocaleDateString()}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Days on Waitlist:</strong> {Math.floor((new Date() - new Date(selectedRecipient.waitlist_date)) / (1000 * 60 * 60 * 24))} days
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Contact:</strong> {selectedRecipient.phone || 'N/A'} | {selectedRecipient.email || 'N/A'}
            </div>
            {selectedRecipient.address && (
              <div style={{ marginBottom: '12px' }}>
                <strong>Address:</strong> {selectedRecipient.address}, {selectedRecipient.city}, {selectedRecipient.state}
              </div>
            )}
          </div>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Patient Name</th>
              <th style={styles.th}>Hospital</th>
              <th style={styles.th}>Required Organ</th>
              <th style={styles.th}>Blood Type</th>
              <th style={styles.th}>Urgency</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Days Waiting</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecipients.map(recipient => {
              const daysWaiting = Math.floor((new Date() - new Date(recipient.waitlist_date)) / (1000 * 60 * 60 * 24));
              return (
                <tr key={recipient.recipient_id}>
                  <td style={styles.td}>
                    {recipient.first_name} {recipient.last_name}
                  </td>
                  <td style={styles.td}>{recipient.hospital_name}</td>
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
                  <td style={styles.td}>{daysWaiting} days</td>
                  <td style={styles.td}>
                    <button style={styles.button} onClick={() => setSelectedRecipient(recipient)}>
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminRecipientViewer;

