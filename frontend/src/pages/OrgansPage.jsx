import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { organAPI } from '../services/api';
import { Package } from 'lucide-react';

const OrgansPage = () => {
  const [organs, setOrgans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrgans();
  }, []);

  const fetchOrgans = async () => {
    try {
      const response = await organAPI.getAll({ limit: 50 });
      setOrgans(response.data.data || []);
    } catch (error) {
      console.error('Error fetching organs:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Organs</h1>
          <button className="btn btn-primary">+ Register New Organ</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organs.map((organ) => (
            <div key={organ.organ_id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Package className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 capitalize">{organ.organ_type}</h3>
                    <p className="text-sm text-gray-600">Blood Type: {organ.blood_type}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  organ.is_available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {organ.is_available ? 'Available' : 'Allocated'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Donor:</strong> {organ.donor_name}</p>
                <p><strong>Hospital:</strong> {organ.hospital_name}</p>
                {organ.procurement_date && (
                  <p><strong>Procured:</strong> {new Date(organ.procurement_date).toLocaleDateString()}</p>
                )}
              </div>

              {organ.is_available && (
                <button className="mt-4 w-full btn btn-primary text-sm">
                  Find Matches
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default OrgansPage;
