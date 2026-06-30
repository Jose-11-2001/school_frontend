import React, { useState, useEffect } from 'react';

function SubjectApprovals() {
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadSelections();
  }, []);

  const loadSelections = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/FormTeacher/subject-selections', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelections(data);
      } else {
        setError('Failed to load subject selections');
      }
    } catch (error) {
      console.error('Error loading selections:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (selectionId, studentName, subjectName) => {
    if (!confirm(`Approve ${subjectName} for ${studentName}?`)) return;

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/FormTeacher/approve-subject-selection/${selectionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess(`✅ ${subjectName} approved for ${studentName}`);
        loadSelections();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to approve selection');
      }
    } catch (error) {
      console.error('Error approving selection:', error);
      setError('Failed to approve selection');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading subject selections...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">✅ Subject Approvals</h2>
          <p className="text-sm text-gray-500">Approve subject selections made by students</p>
        </div>
        <button onClick={loadSelections} className="text-blue-500 hover:text-blue-700">
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-green-50 text-green-700 border border-green-200 mb-4">
          {success}
        </div>
      )}

      {selections.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No pending subject selections.</p>
          <p className="text-sm text-gray-400 mt-1">All selections have been approved.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {selections.map((selection) => (
                <tr key={selection.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono">{selection.admissionNumber}</td>
                  <td className="px-6 py-4 text-sm font-medium">{selection.studentName}</td>
                  <td className="px-6 py-4 text-sm">{selection.subjectName}</td>
                  <td className="px-6 py-4 text-sm">{selection.term} {selection.academicYear}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleApprove(selection.id, selection.studentName, selection.subjectName)}
                      disabled={processing}
                      className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 disabled:bg-gray-400 text-sm"
                    >
                      ✅ Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SubjectApprovals;