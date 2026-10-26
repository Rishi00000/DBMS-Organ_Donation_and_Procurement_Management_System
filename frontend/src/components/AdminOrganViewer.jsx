import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminOrganViewer = () => {
  const [organs, setOrgans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [selectedOrgan, setSelectedOrgan] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [organsRes, hospitalsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/organs?is_available=true', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:3000/api/hospitals', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setOrgans(organsRes.data.data || []);
      setHospitals(hospitalsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrgans = selectedHospital
    ? organs.filter(o => {
        // Filter by hospital_name if available
        const hospital = hospitals.find(h => h.hospital_id === parseInt(selectedHospital));
        return hospital && o.hospital_name === hospital.name;
      })
    : organs;

  const organTypes = {
    heart: '❤️',
    kidney: '🫘',
    liver: '🫀',
    lung: '🫁',
    pancreas: '🧬',
    intestine: '🦠',
    cornea: '👁️'
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
    organCard: {
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
        <h2 style={styles.title}>All Available Organs ({filteredOrgans.length})</h2>
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

      {selectedOrgan ? (
        <div>
          <button style={styles.button} onClick={() => setSelectedOrgan(null)}>
            ← Back to List
          </button>
          <div style={styles.organCard}>
            <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>
              {organTypes[selectedOrgan.organ_type] || '⚫'} {selectedOrgan.organ_type}
            </h3>
            <div style={{ marginBottom: '12px' }}>
              <strong>Donor:</strong> {selectedOrgan.donor_name}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Hospital:</strong> {selectedOrgan.hospital_name}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Blood Type:</strong> {selectedOrgan.blood_type}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Status:</strong>{' '}
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: selectedOrgan.is_available ? '#d1fae5' : '#fee2e2',
                color: selectedOrgan.is_available ? '#065f46' : '#991b1b',
                fontSize: '12px'
              }}>
                {selectedOrgan.is_available ? 'Available' : 'Allocated'}
              </span>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>HLA Typing:</strong> {selectedOrgan.hla_typing || 'Not provided'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Organ Condition:</strong> {selectedOrgan.organ_condition || 'Not specified'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Procurement Date:</strong> {new Date(selectedOrgan.procurement_date).toLocaleDateString()}
            </div>
            {selectedOrgan.expiry_time && (
              <div style={{ marginBottom: '12px' }}>
                <strong>Expiry Time:</strong> {new Date(selectedOrgan.expiry_time).toLocaleString()}
              </div>
            )}
            <div style={{ marginBottom: '12px' }}>
              <strong>Created At:</strong> {new Date(selectedOrgan.created_at).toLocaleString()}
            </div>
            {selectedOrgan.allocated_at && (
              <div style={{ marginBottom: '12px' }}>
                <strong>Allocated At:</strong> {new Date(selectedOrgan.allocated_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Organ Type</th>
              <th style={styles.th}>Donor</th>
              <th style={styles.th}>Hospital</th>
              <th style={styles.th}>Blood Type</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Procurement Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrgans.map(organ => (
              <tr key={organ.organ_id}>
                <td style={styles.td}>
                  {organTypes[organ.organ_type] || '⚫'} {organ.organ_type}
                </td>
                <td style={styles.td}>{organ.donor_name}</td>
                <td style={styles.td}>{organ.hospital_name}</td>
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
                <td style={styles.td}>
                  <button style={styles.button} onClick={() => setSelectedOrgan(organ)}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrganViewer;

