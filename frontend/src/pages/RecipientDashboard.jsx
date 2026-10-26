import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { recipientAPI, matchAPI } from '../services/api';
import { Activity, Clock, AlertCircle } from 'lucide-react';

const RecipientDashboard = () => {
  const { user } = useAuth();
  const [recipientData, setRecipientData] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch recipient details and matches
      const recipientsRes = await recipientAPI.getAll({ user_id: user.user_id });
      if (recipientsRes.data.data?.length > 0) {
        const recipient = recipientsRes.data.data[0];
        setRecipientData(recipient);
        
        const matchesRes = await matchAPI.getRecipientMatches(recipient.recipient_id);
        setMatches(matchesRes.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Waitlist Status</h1>

        {recipientData ? (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {recipientData.first_name} {recipientData.last_name}
                  </h2>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      <span>Required Organ: <strong className="capitalize">{recipientData.required_organ}</strong></span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Days on Waitlist: <strong>{recipientData.days_on_waitlist}</strong></span>
                    </div>
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span>Urgency Level: <strong className="capitalize">{recipientData.urgency_level}</strong></span>
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-lg font-medium ${
                  recipientData.status === 'active' ? 'bg-green-100 text-green-800' :
                  recipientData.status === 'matched' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {recipientData.status.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Matches */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Potential Matches</h3>
              {matches.length > 0 ? (
                <div className="space-y-3">
                  {matches.map((match) => (
                    <div key={match.match_id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">Match ID: {match.match_id}</p>
                          <p className="text-sm text-gray-600">Compatibility: {match.compatibility_score}%</p>
                          <p className="text-sm text-gray-600 capitalize">Status: {match.match_status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No matches found yet. You will be notified when a match is found.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">No recipient profile found for your account. Please contact your healthcare provider.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RecipientDashboard;
