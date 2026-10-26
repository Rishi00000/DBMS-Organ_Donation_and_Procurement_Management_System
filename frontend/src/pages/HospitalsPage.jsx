import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { hospitalAPI } from '../services/api';
import { Hospital, MapPin, Phone, Mail } from 'lucide-react';

const HospitalsPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await hospitalAPI.getAll({ status: 'approved' });
      setHospitals(response.data.data || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Hospitals</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hospital) => (
            <div key={hospital.hospital_id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start mb-4">
                <Hospital className="w-10 h-10 text-blue-600 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{hospital.name}</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {hospital.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{hospital.address}, {hospital.city}, {hospital.state}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{hospital.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{hospital.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default HospitalsPage;
