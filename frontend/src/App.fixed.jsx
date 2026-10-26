import React, { useState, createContext, useContext, useEffect } from 'react';
import axios from 'axios';

// Auth Context
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        username,
        password
      });
      const { user: userData, token } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Login Page Component
const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔐 Attempting login...', { username });
    
    const result = await login(username, password);
    
    if (result.success) {
      console.log('✅ Login successful!');
      // The App component will handle the redirect
    } else {
      console.error('❌ Login failed:', result.error);
      setError(result.error);
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #dbeafe, #bfdbfe)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      padding: '40px',
      maxWidth: '450px',
      width: '100%',
      margin: '20px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    logo: {
      fontSize: '48px',
      marginBottom: '10px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1e40af',
      marginBottom: '8px'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '16px'
    },
    error: {
      backgroundColor: '#fee2e2',
      border: '1px solid #ef4444',
      color: '#991b1b',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    button: {
      padding: '14px',
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    demoBox: {
      backgroundColor: '#f3f4f6',
      padding: '16px',
      borderRadius: '8px',
      marginTop: '20px',
      fontSize: '13px',
      color: '#4b5563'
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

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#1d4ed8')}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={styles.demoBox}>
          <strong>Demo Credentials:</strong><br />
          <span style={{ display: 'block', marginTop: '8px' }}>
            <strong>Admin:</strong> admin / admin123
          </span>
          <span style={{ display: 'block', marginTop: '4px' }}>
            <strong>Hospital Staff:</strong> apollo_staff1 / staff123
          </span>
          <span style={{ display: 'block', marginTop: '4px' }}>
            <strong>Recipient:</strong> patient_arjun / patient123
          </span>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (user?.role === 'admin' && token) {
          const response = await axios.get('http://localhost:3000/api/admin/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

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
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1e40af',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    badge: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '500'
    },
    logoutBtn: {
      padding: '8px 16px',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    },
    main: {
      padding: '32px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    greeting: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '24px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    statTitle: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    statValue: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#2563eb'
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.title}>
          <span>🏥</span>
          <span>ODPMS</span>
        </div>
        <div style={styles.userInfo}>
          <span style={styles.badge}>
            {user?.username} • {user?.role}
          </span>
          <button
            style={styles.logoutBtn}
            onClick={logout}
            onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <h1 style={styles.greeting}>
          Welcome back, {user?.username}! 👋
        </h1>

        {user?.role === 'admin' && !loading && stats && (
          <div style={styles.statsGrid}>
            <div
              style={styles.statCard}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
              <div style={styles.statTitle}>Active Donors</div>
              <div style={styles.statValue}>{stats.active_donors || 0}</div>
            </div>
            <div
              style={styles.statCard}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
              <div style={styles.statTitle}>Active Recipients</div>
              <div style={styles.statValue}>{stats.active_recipients || 0}</div>
            </div>
            <div
              style={styles.statCard}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
              <div style={styles.statTitle}>Available Organs</div>
              <div style={styles.statValue}>{stats.available_organs || 0}</div>
            </div>
            <div
              style={styles.statCard}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
              <div style={styles.statTitle}>Successful Transplants</div>
              <div style={styles.statValue}>{stats.successful_transplants || 0}</div>
            </div>
          </div>
        )}

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>
            🔋 System Status
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ color: '#059669', fontSize: '16px', fontWeight: '500' }}>
              ✅ All systems operational
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
              <div>🌐 Backend API: Connected</div>
              <div>💾 Database: Active</div>
              <div>👤 Role: {user?.role}</div>
              <div>🆔 User ID: {user?.user_id}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Main App Component
function App() {
  const { user, loading } = useAuth();

  console.log('App render - User:', user, 'Loading:', loading);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        color: '#6b7280'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginPage />;
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
