import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Home, Users, Activity, Package, GitMerge, ClipboardList, LogOut, Hospital } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin', icon: Home, label: 'Dashboard' },
    { to: '/hospitals', icon: Hospital, label: 'Hospitals' },
    { to: '/donors', icon: Users, label: 'Donors' },
    { to: '/recipients', icon: Activity, label: 'Recipients' },
    { to: '/organs', icon: Package, label: 'Organs' },
    { to: '/matches', icon: GitMerge, label: 'Matches' },
    { to: '/transplants', icon: ClipboardList, label: 'Transplants' },
  ];

  const hospitalLinks = [
    { to: '/hospital', icon: Home, label: 'Dashboard' },
    { to: '/donors', icon: Users, label: 'Donors' },
    { to: '/recipients', icon: Activity, label: 'Recipients' },
    { to: '/organs', icon: Package, label: 'Organs' },
    { to: '/matches', icon: GitMerge, label: 'Matches' },
    { to: '/transplants', icon: ClipboardList, label: 'Transplants' },
  ];

  const recipientLinks = [
    { to: '/recipient', icon: Home, label: 'Dashboard' },
  ];

  const getLinks = () => {
    if (user?.role === 'admin') return adminLinks;
    if (user?.role === 'hospital_staff') return hospitalLinks;
    return recipientLinks;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-blue-600 text-white">
            <Heart className="w-8 h-8 mr-2" />
            <span className="text-xl font-bold">ODPMS</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {getLinks().map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <link.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t">
            <div className="mb-3 px-4">
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
