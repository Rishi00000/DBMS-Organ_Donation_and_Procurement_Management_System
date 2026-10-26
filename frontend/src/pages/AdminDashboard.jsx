import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { adminAPI } from '../services/api';
import { Users, Activity, Package, CheckCircle, Hospital, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    {
      title: 'Active Donors',
      value: stats.active_donors || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Recipients',
      value: stats.active_recipients || 0,
      icon: Activity,
      color: 'bg-purple-500',
    },
    {
      title: 'Available Organs',
      value: stats.available_organs || 0,
      icon: Package,
      color: 'bg-green-500',
    },
    {
      title: 'Successful Transplants',
      value: stats.successful_transplants || 0,
      icon: CheckCircle,
      color: 'bg-orange-500',
    },
    {
      title: 'Approved Hospitals',
      value: stats.approved_hospitals || 0,
      icon: Hospital,
      color: 'bg-indigo-500',
    },
    {
      title: 'Pending Matches',
      value: stats.pending_matches || 0,
      icon: TrendingUp,
      color: 'bg-red-500',
    },
  ] : [];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="btn btn-primary">Manage Hospitals</button>
            <button className="btn btn-primary">View Audit Logs</button>
            <button className="btn btn-primary">Generate Reports</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
