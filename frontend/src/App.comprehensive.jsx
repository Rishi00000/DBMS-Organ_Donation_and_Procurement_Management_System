import React, { useState, createContext, useContext, useEffect } from 'react';
import AdminRecipientViewer from "./components/AdminRecipientViewer";
import AdminOrganViewer from "./components/AdminOrganViewer";
import axios from 'axios';
import EnhancedLogin from './pages/EnhancedLogin';
import HospitalRegister from './pages/HospitalRegister';
import HospitalDashboardComprehensive from './components/HospitalDashboard.comprehensive';

// ===================================
// AUTH CONTEXT
// ===================================
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (e) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// ===================================
// ADMIN: HOSPITAL APPROVAL PAGE
// ===================================
const AdminHospitalApproval = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingHospitals();
  }, []);

  const fetchPendingHospitals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/hospitals/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHospitals(response.data.data);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (hospitalId) => {
    if (!confirm('Are you sure you want to approve this hospital?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/hospitals/${hospitalId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Hospital approved successfully!');
      fetchPendingHospitals();
    } catch (error) {
      alert('Error approving hospital: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleReject = async (hospitalId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/hospitals/${hospitalId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Hospital rejected successfully!');
      fetchPendingHospitals();
    } catch (error) {
      alert('Error rejecting hospital: ' + (error.response?.data?.error || error.message));
    }
  };

  const styles = {
    container: {
      padding: '32px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '32px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#6b7280'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '24px',
      marginBottom: '20px'
    },
    hospitalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    hospitalTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '4px'
    },
    badge: {
      padding: '6px 12px',
      backgroundColor: '#fef3c7',
      color: '#92400e',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      marginBottom: '20px'
    },
    infoItem: {
      fontSize: '14px',
      color: '#6b7280'
    },
    infoLabel: {
      fontWeight: '600',
      color: '#374151',
      display: 'inline-block',
      marginRight: '8px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: '1px solid #e5e7eb'
    },
    approveBtn: {
      padding: '10px 24px',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600'
    },
    rejectBtn: {
      padding: '10px 24px',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6b7280'
    }
  };

  if (loading) {
    return <div style={styles.container}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🏥 Hospital Approval Requests</h1>
        <p style={styles.subtitle}>Review and approve new hospital registrations</p>
      </div>

      {hospitals.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>All caught up!</p>
          <p>No pending hospital approval requests at the moment.</p>
        </div>
      ) : (
        hospitals.map((hospital) => (
          <div key={hospital.hospital_id} style={styles.card}>
            <div style={styles.hospitalHeader}>
              <div>
                <h2 style={styles.hospitalTitle}>{hospital.name}</h2>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Reg. No: {hospital.registration_number}
                </p>
              </div>
              <span style={styles.badge}>PENDING REVIEW</span>
            </div>

            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>📍 Address:</span>
                {hospital.address}, {hospital.city}, {hospital.state} - {hospital.postal_code}
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>📞 Phone:</span>
                {hospital.phone}
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>📧 Email:</span>
                {hospital.email}
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>👤 Username:</span>
                {hospital.username}
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>📅 Registered:</span>
                {new Date(hospital.created_at).toLocaleDateString()}
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button
                style={styles.approveBtn}
                onClick={() => handleApprove(hospital.hospital_id)}
                onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
              >
                ✅ Approve Hospital
              </button>
              <button
                style={styles.rejectBtn}
                onClick={() => handleReject(hospital.hospital_id)}
                onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
              >
                ❌ Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// ===================================
// SIMPLE ADMIN DASHBOARD
// ===================================
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    if (currentView === 'dashboard') {
      fetchStats();
    }
  }, [currentView]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '16px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    nav: {
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 32px',
      display: 'flex',
      gap: '32px'
    },
    navItem: {
      padding: '16px 0',
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      transition: 'all 0.2s'
    },
    navItemActive: {
      borderBottomColor: '#667eea',
      color: '#667eea',
      fontWeight: '600'
    },
    logoutBtn: {
      padding: '8px 16px',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    statsGrid: {
      padding: '32px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    statValue: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#2563eb'
    },
    statLabel: {
      fontSize: '14px',
      color: '#6b7280',
      marginTop: '8px'
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
          🏥 ODPMS Admin
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            {user?.username} • {user?.role}
          </span>
          <button style={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <nav style={styles.nav}>
        <div
          style={{
            ...styles.navItem,
            ...(currentView === 'dashboard' ? styles.navItemActive : {})
          }}
          onClick={() => setCurrentView('dashboard')}
        >
          Dashboard
        </div>
        <div
          style={{
            ...styles.navItem,
            ...(currentView === 'donors' ? styles.navItemActive : {})
          }}
          onClick={() => setCurrentView('donors')}
        >
          View Donors
        </div>
        <div
          style={{
            ...styles.navItem,
            ...(currentView === 'approvals' ? styles.navItemActive : {})
          }}
          onClick={() => setCurrentView('approvals')}
        >
          Hospital Approvals
        </div>
      </nav>

      {currentView === 'dashboard' && stats && (
        <div style={styles.statsGrid}>
          <div 
            style={{ ...styles.statCard, cursor: 'pointer' }}
            onClick={() => setCurrentView('donors')}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <div style={styles.statValue}>{stats.active_donors || 0}</div>
            <div style={styles.statLabel}>Active Donors (Click to view)</div>
          </div>
          <div 
            style={{ ...styles.statCard, cursor: 'pointer' }}
            onClick={() => setCurrentView('recipients')}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <div style={styles.statValue}>{stats.active_recipients || 0}</div>
            <div style={styles.statLabel}>Recipients on Waitlist (Click to view)</div>
          </div>
          <div 
            style={{ ...styles.statCard, cursor: 'pointer' }}
            onClick={() => setCurrentView('organs')}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <div style={styles.statValue}>{stats.available_organs || 0}</div>
            <div style={styles.statLabel}>Available Organs (Click to view)</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.successful_transplants || 0}</div>
            <div style={styles.statLabel}>Successful Transplants</div>
          </div>
        </div>
      )}

      {currentView === 'approvals' && <AdminHospitalApproval />}
      {currentView === 'donors' && <AdminDonorViewer />}
      {currentView === 'recipients' && <AdminRecipientViewer />}
      {currentView === 'organs' && <AdminOrganViewer />}
    </div>
  );
};

// ===================================
// ADMIN DONOR VIEWER COMPONENT
// ===================================
const AdminDonorViewer = () => {
  const [donors, setDonors] = useState([]);
  const [organs, setOrgans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [donorsRes, organsRes, hospitalsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/donors', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:3000/api/organs', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:3000/api/hospitals', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setDonors(donorsRes.data.data || []);
      setOrgans(organsRes.data.data || []);
      setHospitals(hospitalsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonors = selectedHospital
    ? donors.filter(d => d.hospital_id === parseInt(selectedHospital))
    : donors;

  const getDonorOrgans = (donorId) => {
    return organs.filter(o => o.donor_id === donorId);
  };

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
    donorCard: {
      background: '#f9fafb',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '16px',
      border: '2px solid #e5e7eb'
    },
    organBadge: {
      display: 'inline-block',
      padding: '4px 8px',
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      borderRadius: '6px',
      fontSize: '12px',
      marginRight: '8px',
      marginBottom: '4px'
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
        <h2 style={styles.title}>All Donors ({filteredDonors.length})</h2>
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

      {selectedDonor ? (
        <div>
          <button style={styles.button} onClick={() => setSelectedDonor(null)}>
            ← Back to List
          </button>
          <div style={styles.donorCard}>
            <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>
              {selectedDonor.first_name} {selectedDonor.last_name}
            </h3>
            <div style={{ marginBottom: '12px' }}>
              <strong>Hospital:</strong> {selectedDonor.hospital_name}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Blood Type:</strong> {selectedDonor.blood_type}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Donor Type:</strong> {selectedDonor.is_living ? 'Living Donor' : 'Deceased Donor'}
            </div>
            {selectedDonor.date_of_death && (
              <div style={{ marginBottom: '12px' }}>
                <strong>Date of Death:</strong> {new Date(selectedDonor.date_of_death).toLocaleDateString()}
              </div>
            )}
            <div style={{ marginBottom: '12px' }}>
              <strong>HLA Typing:</strong> {selectedDonor.hla_typing || 'Not provided'}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Medical History:</strong> {selectedDonor.medical_history || 'None'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Consent Signed:</strong> {selectedDonor.consent_signed ? 'Yes' : 'No'}
            </div>
            {selectedDonor.consent_date && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Consent Date:</strong> {new Date(selectedDonor.consent_date).toLocaleDateString()}
              </div>
            )}
            <div>
              <strong>Organs Being Donated:</strong>
              <div style={{ marginTop: '8px' }}>
                {getDonorOrgans(selectedDonor.donor_id).length > 0 ? (
                  getDonorOrgans(selectedDonor.donor_id).map(organ => (
                    <span key={organ.organ_id} style={styles.organBadge}>
                      {organTypes[organ.organ_type] || '⚫'} {organ.organ_type} 
                      ({organ.is_available ? 'Available' : 'Allocated'})
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#6b7280' }}>No organs registered yet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Donor Name</th>
              <th style={styles.th}>Hospital</th>
              <th style={styles.th}>Blood Type</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Organs</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDonors.map(donor => {
              const donorOrgans = getDonorOrgans(donor.donor_id);
              return (
                <tr key={donor.donor_id}>
                  <td style={styles.td}>
                    {donor.first_name} {donor.last_name}
                  </td>
                  <td style={styles.td}>{donor.hospital_name}</td>
                  <td style={styles.td}>{donor.blood_type}</td>
                  <td style={styles.td}>
                    {donor.is_living ? 'Living' : 'Deceased'}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: donor.status === 'available' ? '#d1fae5' : '#e5e7eb',
                      color: donor.status === 'available' ? '#065f46' : '#4b5563',
                      fontSize: '12px'
                    }}>
                      {donor.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {donorOrgans.length > 0 ? (
                      <div>
                        {donorOrgans.map(organ => (
                          <span key={organ.organ_id} style={styles.organBadge}>
                            {organTypes[organ.organ_type] || '⚫'} {organ.organ_type}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#6b7280' }}>None</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <button style={styles.button} onClick={() => setSelectedDonor(donor)}>
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

// ===================================
// HOSPITAL DASHBOARD (Use Comprehensive Version)
// ===================================
const HospitalDashboard = () => {
  const { user, logout } = useAuth();
  return <HospitalDashboardComprehensive user={user} onLogout={logout} />;
};

// ===================================
// PATIENT DASHBOARD (Complete Implementation)
// ===================================
const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [recipient, setRecipient] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingContact, setEditingContact] = useState(false);
  const [contactData, setContactData] = useState({ phone: '', email: '', address: '', city: '', state: '', postal_code: '' });

  useEffect(() => {
    if (user && user.user_id) {
      fetchPatientData();
    } else if (user && !user.user_id) {
      setError('User information is incomplete. Please contact support.');
      setLoading(false);
    } else if (!user) {
      setError('User not found. Please login again.');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]); // Only depend on user_id to avoid unnecessary re-renders

  const fetchPatientData = async () => {
    if (!user || !user.user_id) {
      setError('User information not available');
      setLoading(false);
      return;
    }

    try {
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      // Get recipient by user_id
      const recipientRes = await axios.get(
        `http://localhost:3000/api/recipients?user_id=${user.user_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (recipientRes.data.data && recipientRes.data.data.length > 0) {
        const recipientData = recipientRes.data.data[0];
        setRecipient(recipientData);
        setContactData({
          phone: recipientData.phone || '',
          email: recipientData.email || '',
          address: recipientData.address || '',
          city: recipientData.city || '',
          state: recipientData.state || '',
          postal_code: recipientData.postal_code || ''
        });

        // Get matches for this recipient
        try {
          const matchesRes = await axios.get(
            `http://localhost:3000/api/matches/recipient/${recipientData.recipient_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setMatches(matchesRes.data.data || []);
        } catch (matchErr) {
          console.error('Error fetching matches:', matchErr);
          // Don't fail the whole component if matches fail
          setMatches([]);
        }
      } else {
        setError('No recipient information found. Please contact your hospital.');
      }
    } catch (err) {
      console.error('Error fetching patient data:', err);
      setError('Failed to load patient information: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContact = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/recipients/${recipient.recipient_id}`,
        contactData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingContact(false);
      fetchPatientData();
      alert('Contact information updated successfully!');
    } catch (err) {
      alert('Failed to update contact: ' + (err.response?.data?.error || err.message));
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
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      padding: '16px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    content: {
      padding: '40px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '32px',
      borderRadius: '24px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      marginBottom: '24px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '16px'
    },
    section: {
      marginBottom: '24px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#6b7280',
      marginBottom: '6px',
      display: 'block'
    },
    value: {
      fontSize: '16px',
      color: '#111827',
      marginBottom: '12px'
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
      marginRight: '8px'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '12px'
    },
    matchCard: {
      background: '#f9fafb',
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '12px',
      border: '2px solid #e5e7eb'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.content, textAlign: 'center', color: '#ffffff' }}>
          <div style={{ fontSize: '18px', marginBottom: '16px' }}>Loading your information...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
            🧑‍⚕️ Patient Portal
          </div>
          <button
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={logout}
          >
            Logout
          </button>
        </header>
        <div style={styles.content}>
          <div style={{
            ...styles.card,
            backgroundColor: '#fee2e2',
            borderColor: '#ef4444'
          }}>
            <h2 style={{ color: '#991b1b', marginBottom: '16px' }}>⚠️ Error</h2>
            <p style={{ color: '#991b1b', marginBottom: '16px' }}>{error}</p>
            <button
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onClick={fetchPatientData}
            >
              Retry
            </button>
            <button
              style={{
                padding: '10px 20px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                marginLeft: '12px'
              }}
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!recipient) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
            🧑‍⚕️ Patient Portal
          </div>
          <button
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={logout}
          >
            Logout
          </button>
        </header>
        <div style={styles.content}>
          <div style={styles.card}>
            <h2 style={{ color: '#991b1b', marginBottom: '16px' }}>⚠️ No Information Found</h2>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              No recipient information found for your account. Please contact your hospital.
            </p>
            <button
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onClick={fetchPatientData}
            >
              Retry
            </button>
            <button
              style={{
                padding: '10px 20px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                marginLeft: '12px'
              }}
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
          🧑‍⚕️ Patient Portal
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
              cursor: 'pointer'
            }}
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>
      <div style={styles.content}>
        {/* Waitlist Status Card */}
        <div style={styles.card}>
          <h2 style={styles.title}>Your Waitlist Status</h2>
          <div style={styles.section}>
            <span style={styles.label}>Status:</span>
            <span style={{
              ...styles.value,
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: statusColors[recipient.status]?.bg || '#e5e7eb',
              color: statusColors[recipient.status]?.color || '#4b5563',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {recipient.status}
            </span>
          </div>
          <div style={styles.section}>
            <span style={styles.label}>Required Organ:</span>
            <span style={styles.value}>{recipient.required_organ}</span>
          </div>
          <div style={styles.section}>
            <span style={styles.label}>Urgency Level:</span>
            <span style={{
              ...styles.value,
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: urgencyColors[recipient.urgency_level]?.bg || '#e5e7eb',
              color: urgencyColors[recipient.urgency_level]?.color || '#4b5563',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {urgencyColors[recipient.urgency_level]?.label || recipient.urgency_level}
            </span>
          </div>
          <div style={styles.section}>
            <span style={styles.label}>Days on Waitlist:</span>
            <span style={styles.value}>{recipient.days_on_waitlist || 0} days</span>
          </div>
          <div style={styles.section}>
            <span style={styles.label}>Blood Type:</span>
            <span style={styles.value}>{recipient.blood_type}</span>
          </div>
        </div>

        {/* Potential Matches Card */}
        {matches.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.title}>Potential Organ Matches</h2>
            {matches.map(match => {
              const compatibilityScore = match.compatibility_score 
                ? (typeof match.compatibility_score === 'number' 
                    ? match.compatibility_score.toFixed(2) 
                    : parseFloat(match.compatibility_score || 0).toFixed(2))
                : 'N/A';
              
              return (
                <div key={match.match_id || Math.random()} style={styles.matchCard}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Compatibility Score:</strong> {compatibilityScore}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Organ Type:</strong> {match.organ_type || 'N/A'} (Blood: {match.blood_type || 'N/A'})
                  </div>
                  {match.hla_match_score && (
                    <div style={{ marginBottom: '8px' }}>
                      <strong>HLA Match:</strong> {match.hla_match_score} / 12
                    </div>
                  )}
                  <div style={{ 
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: match.match_status === 'pending' ? '#dbeafe' : 
                                     match.match_status === 'accepted' ? '#d1fae5' : '#fee2e2',
                    color: match.match_status === 'pending' ? '#1e40af' : 
                           match.match_status === 'accepted' ? '#065f46' : '#991b1b',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginTop: '8px'
                  }}>
                    Status: {match.match_status || 'N/A'}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Contact Information Card */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={styles.title}>Contact Information</h2>
            {!editingContact ? (
              <button style={styles.button} onClick={() => setEditingContact(true)}>
                Edit Contact
              </button>
            ) : (
              <div>
                <button style={styles.button} onClick={handleUpdateContact}>
                  Save
                </button>
                <button style={{ ...styles.button, backgroundColor: '#6b7280' }} onClick={() => {
                  setEditingContact(false);
                  fetchPatientData(); // Reset
                }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
          {editingContact ? (
            <div>
              <input
                type="tel"
                style={styles.input}
                placeholder="Phone"
                value={contactData.phone}
                onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
              />
              <input
                type="email"
                style={styles.input}
                placeholder="Email"
                value={contactData.email}
                onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
              />
              <input
                type="text"
                style={styles.input}
                placeholder="Address"
                value={contactData.address}
                onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="City"
                  value={contactData.city}
                  onChange={(e) => setContactData({ ...contactData, city: e.target.value })}
                />
                <input
                  type="text"
                  style={styles.input}
                  placeholder="State"
                  value={contactData.state}
                  onChange={(e) => setContactData({ ...contactData, state: e.target.value })}
                />
              </div>
              <input
                type="text"
                style={styles.input}
                placeholder="Postal Code"
                value={contactData.postal_code}
                onChange={(e) => setContactData({ ...contactData, postal_code: e.target.value })}
              />
            </div>
          ) : (
            <div>
              <div style={styles.section}>
                <span style={styles.label}>Phone:</span>
                <span style={styles.value}>{contactData.phone || 'Not provided'}</span>
              </div>
              <div style={styles.section}>
                <span style={styles.label}>Email:</span>
                <span style={styles.value}>{contactData.email || 'Not provided'}</span>
              </div>
              <div style={styles.section}>
                <span style={styles.label}>Address:</span>
                <span style={styles.value}>
                  {contactData.address || 'Not provided'}{contactData.city ? `, ${contactData.city}` : ''}
                  {contactData.state ? `, ${contactData.state}` : ''} {contactData.postal_code || ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===================================
// MAIN APP WITH ROUTING
// ===================================
function MainApp() {
  const { user, setUser, loading } = useAuth();
  
  // Initialize page based on current URL
  const getInitialPage = () => {
    const path = window.location.pathname;
    if (path === '/register-hospital') return 'register';
    return 'login';
  };
  
  const [currentPage, setCurrentPage] = useState(getInitialPage);

  useEffect(() => {
    // Handle browser back/forward navigation
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/register-hospital') {
        setCurrentPage('register');
      } else {
        setCurrentPage('login');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL when page changes
  useEffect(() => {
    if (currentPage === 'register') {
      window.history.pushState({}, '', '/register-hospital');
    } else if (currentPage === 'login') {
      window.history.pushState({}, '', '/');
    }
  }, [currentPage]);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleNavigateToRegister = () => {
    setCurrentPage('register');
  };

  const handleNavigateToLogin = () => {
    setCurrentPage('login');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px'
      }}>
        Loading...
      </div>
    );
  }

  // Routing logic
  if (!user) {
    if (currentPage === 'register') {
      return <HospitalRegister onNavigateToLogin={handleNavigateToLogin} />;
    }
    return <EnhancedLogin onLoginSuccess={handleLoginSuccess} onNavigateToRegister={handleNavigateToRegister} />;
  }

  // Role-based dashboards
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user.role === 'hospital_staff') {
    return <HospitalDashboard />;
  }

  if (user.role === 'recipient') {
    return <PatientDashboard />;
  }

  return <div>Unknown user role</div>;
}

// ===================================
// ROOT COMPONENT
// ===================================
export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
