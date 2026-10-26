import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import RecipientDashboard from './pages/RecipientDashboard';
import HospitalsPage from './pages/HospitalsPage';
import DonorsPage from './pages/DonorsPage';
import RecipientsPage from './pages/RecipientsPage';
import OrgansPage from './pages/OrgansPage';
import MatchesPage from './pages/MatchesPage';
import TransplantsPage from './pages/TransplantsPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

// App Routes Component
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {user?.role === 'admin' && <Navigate to="/admin" />}
            {user?.role === 'hospital_staff' && <Navigate to="/hospital" />}
            {user?.role === 'recipient' && <Navigate to="/recipient" />}
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Hospital Staff Routes */}
      <Route
        path="/hospital"
        element={
          <ProtectedRoute allowedRoles={['hospital_staff']}>
            <HospitalDashboard />
          </ProtectedRoute>
        }
      />

      {/* Recipient Routes */}
      <Route
        path="/recipient"
        element={
          <ProtectedRoute allowedRoles={['recipient']}>
            <RecipientDashboard />
          </ProtectedRoute>
        }
      />

      {/* Shared Routes */}
      <Route
        path="/hospitals"
        element={
          <ProtectedRoute>
            <HospitalsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/donors"
        element={
          <ProtectedRoute allowedRoles={['admin', 'hospital_staff']}>
            <DonorsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recipients"
        element={
          <ProtectedRoute allowedRoles={['admin', 'hospital_staff']}>
            <RecipientsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organs"
        element={
          <ProtectedRoute allowedRoles={['admin', 'hospital_staff']}>
            <OrgansPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/matches"
        element={
          <ProtectedRoute allowedRoles={['admin', 'hospital_staff']}>
            <MatchesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transplants"
        element={
          <ProtectedRoute allowedRoles={['admin', 'hospital_staff']}>
            <TransplantsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">403</h1>
              <p className="text-gray-600">Unauthorized Access</p>
            </div>
          </div>
        }
      />

      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-gray-600">Page Not Found</p>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
