import React, { useState, useEffect } from 'react';

function ResultsApproval() {
  const [pendingResults, setPendingResults] = useState([]);
  const [approvedResults, setApprovedResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [resultDetails, setResultDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPendingResults();
    loadApprovedResults();
  }, []);

  const loadPendingResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5123/api/ResultsApproval/pending-results', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPendingResults(data);
    } catch (error) {
      console.error('Error loading pending results:', error);
    }
  };

  const loadApprovedResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5123/api/ResultsApproval/approved-results', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setApprovedResults(data);
    } catch (error) {
      console.error('Error loading approved results:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewResultDetails = async (subjectId, year, term) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5123/api/ResultsApproval/results-details/${subjectId}/${year}/${term}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setResultDetails(data);
      setSelectedResult({ subjectId, year, term });
    } catch (error) {
      console.error('Error loading result details:', error);
    }
  };

  const approveResults = async (subjectId, year, term, subjectName) => {
    if (!confirm(`Approve results for ${subjectName} (${term} ${year})?\n\nStudents and teachers will be notified.`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5123/api/ResultsApproval/approve-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subjectId, year, term })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ ${data.message} (${data.studentCount} students, ${data.teacherCount} teachers notified)`);
        loadPendingResults();
        loadApprovedResults();
        setResultDetails(null);
        setSelectedResult(null);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error approving results');
    }
    setTimeout(() => setMessage(''), 5000);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Results Approval (Headteacher)</h2>
      
      {message && (
        <div className={`p-3 rounded ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Pending Results for Approval */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4 text-yellow-600">⏳ Pending Results for Approval</h3>
        {pendingResults.length === 0 ? (
          <p className="text-gray-500">No pending results waiting for approval.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingResults.map((result, idx) => (
              <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="font-semibold text-lg">{result.subjectName}</div>
                <div className="text-sm text-gray-600">{result.term} {result.year}</div>
                <div className="text-sm text-gray-500">Students: {result.studentCount}</div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => viewResultDetails(result.subjectId, result.year, result.term)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => approveResults(result.subjectId, result.year, result.term, result.subjectName)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                  >
                    Approve & Publish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Result Details Modal */}
      {resultDetails && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto m-4">
            <div className="p-4 border-b sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Result Details</h3>
                <button
                  onClick={() => setResultDetails(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Admission No</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Student Name</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">CT1 (20%)</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">CT2 (20%)</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">End Term (60%)</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Total</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Grade</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resultDetails.map((result, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-sm">{result.admissionNumber}</td>
                      <td className="px-4 py-2 text-sm font-medium">{result.studentName}</td>
                      <td className="px-4 py-2 text-sm text-center">{result.continuousTest1 || '-'}</td>
                      <td className="px-4 py-2 text-sm text-center">{result.continuousTest2 || '-'}</td>
                      <td className="px-4 py-2 text-sm text-center">{result.endTermExam || '-'}</td>
                      <td className="px-4 py-2 text-sm text-center font-bold">{result.totalScore}%</td>
                      <td className="px-4 py-2 text-sm text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          result.grade === 'A+' ? 'bg-green-100 text-green-800' :
                          result.grade === 'E' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {result.grade}
                        </span>
                      </td>
                    </table>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={() => approveResults(selectedResult.subjectId, selectedResult.year, selectedResult.term, resultDetails[0]?.subjectName || 'Results')}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Approve All & Notify Students
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approved Results */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4 text-green-600">✅ Approved & Published Results</h3>
        {approvedResults.length === 0 ? (
          <p className="text-gray-500">No approved results yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedResults.map((result, idx) => (
              <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="font-semibold text-lg">{result.subjectName}</div>
                <div className="text-sm text-gray-600">{result.term} {result.year}</div>
                <div className="text-sm text-gray-500">Students: {result.studentCount}</div>
                <div className="text-xs text-gray-400 mt-1">Approved: {new Date(result.approvedAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsApproval;