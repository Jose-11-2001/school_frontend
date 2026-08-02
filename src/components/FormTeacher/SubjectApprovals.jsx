import React, { useState, useEffect } from 'react';

function SubjectApprovals() {
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadSubjectSelections();
  }, [filter]);

  const loadSubjectSelections = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = filter === 'pending' 
        ? 'https://school-yathu.onrender.com/api/FormTeacher/subject-selections?pendingOnly=true'
        : 'https://school-yathu.onrender.com/api/FormTeacher/subject-selections';
      
      console.log('Loading subject selections from:', url);
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Subject selections data:', data);
        // Handle different response formats
        const selectionsData = data.selections || data || [];
        setSelections(selectionsData);
      } else {
        setMessage('Failed to load subject selections');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error loading selections:', error);
      setMessage('Network error');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (selectionId) => {
    if (!confirm('Approve this subject selection?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/FormTeacher/approve-subject-selection/${selectionId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage('✅ Subject selection approved successfully!');
        setMessageType('success');
        loadSubjectSelections();
      } else {
        const data = await response.json();
        setMessage(`❌ ${data.message || 'Failed to approve'}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error approving selection:', error);
      setMessage('❌ Network error');
      setMessageType('error');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return <div className="text-center py-8">Loading subject selections...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">📋 Subject Approvals</h2>
          <p className="text-sm text-gray-500 mt-1">Approve or reject student subject selections</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button onClick={loadSubjectSelections} className="text-blue-500 hover:text-blue-700">
            🔄 Refresh
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg mb-4 ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {selections.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No subject selections {filter === 'pending' ? 'pending approval' : 'found'}.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selections.map((selection) => (
                  <tr key={selection.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{selection.studentName}</td>
                    <td className="px-6 py-4 text-sm">{selection.admissionNumber}</td>
                    <td className="px-6 py-4 text-sm">{selection.subjectName}</td>
                    <td className="px-6 py-4 text-sm">{selection.term || 'Term 1'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selection.isApproved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selection.isApproved ? '✅ Approved' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {!selection.isApproved && (
                        <button
                          onClick={() => handleApprove(selection.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                        >
                          Approve
                        </button>
                      )}
                      {selection.isApproved && (
                        <span className="text-sm text-gray-500">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubjectApprovals;