import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { recipientAPI, donorAPI, organAPI, matchAPI } from '../services/api';
import { Users, Activity, Package, TrendingUp } from 'lucide-react';

const HospitalDashboard = () => {
  const [stats, setStats] = useState({ donors: 0, recipients: 0, organs: 0, matches: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [donorsRes, recipientsRes, organsRes, matchesRes] = await Promise.all([
        donorAPI.getAll({ limit: 1 }),
        recipientAPI.getAll({ limit: 1 }),
        organAPI.getAll({ limit: 1 }),
        matchAPI.getAll({ limit: 1 }),
      ]);
      
      setStats({
        donors: donorsRes.data.data?.length || 0,
        recipients: recipientsRes.data.data?.length || 0,
        organs: organsRes.data.data?.length || 0,
        matches: matchesRes.data.data?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Donors', value: stats.donors, icon: Users, color: 'bg-blue-500' },
    { title: 'Total Recipients', value: stats.recipients, icon: Activity, color: 'bg-purple-500' },
    { title: 'Organs Available', value: stats.organs, icon: Package, color: 'bg-green-500' },
    { title: 'Pending Matches', value: stats.matches, icon: TrendingUp, color: 'bg-orange-500' },
  ];

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Hospital Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="btn btn-primary">Register Donor</button>
            <button className="btn btn-primary">Register Recipient</button>
            <button className="btn btn-primary">Register Organ</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HospitalDashboard;
