import React, { useState } from 'react';

function AppSimple() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f9ff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{ 
          fontSize: '36px', 
          color: '#1e40af', 
          marginBottom: '10px',
          fontWeight: 'bold'
        }}>
          🏥 ODPMS System
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: '#6b7280',
          marginBottom: '30px'
        }}>
          Organ Donation & Procurement Management
        </p>
        
        <div style={{
          backgroundColor: '#eff6ff',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ fontSize: '16px', marginBottom: '10px' }}>
            React is working! ✅
          </p>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Counter: <strong style={{ fontSize: '24px', color: '#2563eb' }}>{count}</strong>
          </p>
          <button
            onClick={() => setCount(count + 1)}
            style={{
              marginTop: '15px',
              padding: '10px 30px',
              fontSize: '16px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            Click me!
          </button>
        </div>

        <div style={{
          fontSize: '14px',
          color: '#6b7280',
          marginTop: '20px'
        }}>
          <p>✅ Frontend: Running</p>
          <p>✅ React: Working</p>
          <p>✅ State Management: Working</p>
        </div>
      </div>
    </div>
  );
}

export default AppSimple;
