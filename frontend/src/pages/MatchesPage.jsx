import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { matchAPI } from '../services/api';
import { GitMerge, CheckCircle, XCircle } from 'lucide-react';

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await matchAPI.getAll({ limit: 50 });
      setMatches(response.data.data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (matchId) => {
    try {
      await matchAPI.accept(matchId);
      alert('Match accepted successfully!');
      fetchMatches();
    } catch (error) {
      alert('Error accepting match: ' + error.message);
    }
  };

  const handleReject = async (matchId) => {
    try {
      await matchAPI.reject(matchId, 'Rejected by hospital staff');
      alert('Match rejected');
      fetchMatches();
    } catch (error) {
      alert('Error rejecting match: ' + error.message);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Organ Matches</h1>

        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.match_id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <GitMerge className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-bold text-gray-900">
                      Match #{match.match_id} - {match.organ_type}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1"><strong>Recipient:</strong></p>
                      <p>{match.recipient_name}</p>
                      <p className="text-gray-600">Blood Type: {match.recipient_blood_type}</p>
                      <p className="text-gray-600 capitalize">Urgency: {match.urgency_level}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1"><strong>Donor:</strong></p>
                      <p>{match.donor_name}</p>
                      <p className="text-gray-600">Blood Type: {match.organ_blood_type}</p>
                      <p className="text-gray-600">Hospital: {match.hospital_name}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center space-x-4">
                    <div className="text-sm">
                      <span className="text-gray-600">Compatibility Score: </span>
                      <span className="font-bold text-blue-600">{match.compatibility_score}%</span>
                    </div>
                    {match.hla_match_score && (
                      <div className="text-sm">
                        <span className="text-gray-600">HLA Match: </span>
                        <span className="font-bold text-green-600">{match.hla_match_score}/12</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    match.match_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    match.match_status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {match.match_status}
                  </span>

                  {match.match_status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAccept(match.match_id)}
                        className="btn btn-primary text-sm flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(match.match_id)}
                        className="btn btn-danger text-sm flex items-center"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default MatchesPage;
