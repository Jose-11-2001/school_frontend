import React, { useState, useEffect } from 'react';

function SubjectApprovals() {
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    loadSelections();
  }, []);

  const loadSelections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/FormTeacher/subject-selections', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSelections(data.selections || []);
      }
    } catch (error) {
      console.error('Error loading selections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (selectionId, studentName, subjectName) => {
    if (!confirm(`Approve ${studentName}'s selection for ${subjectName}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/FormTeacher/approve-subject-selection/${selectionId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage(`Subject selection approved!`);
        setMessageType('success');
        loadSelections();
      } else {
        setMessage('Failed to approve selection');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error approving selection:', error);
      setMessage('Network error');
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
          <h2 className="text-2xl font-bold">Subject Approvals</h2>
          <p className="text-sm text-gray-500">Approve student subject selections</p>
        </div>
        <button onClick={loadSelections} className="text-blue-500 hover:text-blue-700">
          Refresh
        </button>
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
          <p className="text-gray-500">No pending subject selections.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term/Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {selections.map((selection) => (
                <tr key={selection.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{selection.studentName}</td>
                  <td className="px-6 py-4 text-sm">{selection.admissionNumber}</td>
                  <td className="px-6 py-4 text-sm">{selection.subjectName}</td>
                  <td className="px-6 py-4 text-sm">{selection.term} {selection.academicYear}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleApprove(selection.id, selection.studentName, selection.subjectName)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                    >
                      Approve
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