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
      const response = await fetch('https://school-yathu.onrender.com/api/ResultsApproval/pending-results', {
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
      const response = await fetch('https://school-yathu.onrender.com/api/ResultsApproval/approved-results', {
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
      const response = await fetch(`https://school-yathu.onrender.com/api/ResultsApproval/results-details/${subjectId}/${year}/${term}`, {
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
    if (!confirm(` Approve results for ${subjectName} (${term} ${year})?\n\nStudents and teachers will be notified.`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/ResultsApproval/approve-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subjectId, year, term })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(` ${data.message} (${data.studentCount} students, ${data.teacherCount} teachers notified)`);
        loadPendingResults();
        loadApprovedResults();
        setResultDetails(null);
        setSelectedResult(null);
      } else {
        setMessage(`${data.message}`);
      }
    } catch (error) {
      setMessage('Error approving results');
    }
    setTimeout(() => setMessage(''), 5000);
  };

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading results...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Results Approval (Headteacher)</h2>
          <p className="text-sm text-gray-500 mt-1">Review and approve teacher-submitted results</p>
        </div>
        <div className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
          Pending: {pendingResults.length} | Approved: {approvedResults.length}
        </div>
      </div>
      
      {message && (
        <div className={`p-3 rounded-lg ${
          message.includes('') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Pending Results for Approval */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200">
          <h3 className="text-xl font-bold text-yellow-800 flex items-center gap-2">
            <span></span> Pending Results for Approval
          </h3>
          <p className="text-sm text-yellow-600 mt-1">Results waiting for headteacher approval</p>
        </div>
        <div className="p-6">
          {pendingResults.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2"></div>
              <p className="text-gray-500">No pending results waiting for approval.</p>
              <p className="text-sm text-gray-400 mt-1">All results have been approved.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingResults.map((result, idx) => (
                <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="font-semibold text-lg text-gray-800">{result.subjectName}</div>
                  <div className="text-sm text-gray-600 mt-1">{result.term} {result.year}</div>
                  <div className="text-sm text-gray-500 mt-1"> Students: {result.studentCount}</div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => viewResultDetails(result.subjectId, result.year, result.term)}
                      className="bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 text-sm transition-colors flex items-center gap-1"
                    >
                       View Details
                    </button>
                    <button
                      onClick={() => approveResults(result.subjectId, result.year, result.term, result.subjectName)}
                      className="bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 text-sm transition-colors flex items-center gap-1"
                    >
                       Approve & Publish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Result Details Modal */}
      {resultDetails && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[85vh] overflow-y-auto m-4">
            <div className="p-4 border-b sticky top-0 bg-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-800"> Result Details</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {resultDetails[0]?.subjectName || 'Results'} - {selectedResult.term} {selectedResult.year}
                  </p>
                </div>
                <button
                  onClick={() => setResultDetails(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">CT1 (20%)</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">CT2 (20%)</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">End Term (60%)</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {resultDetails.map((result, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2 text-sm text-gray-600">{result.admissionNumber}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{result.studentName}</td>
                        <td className="px-4 py-2 text-sm text-center text-gray-600">{result.continuousTest1 || '-'}</td>
                        <td className="px-4 py-2 text-sm text-center text-gray-600">{result.continuousTest2 || '-'}</td>
                        <td className="px-4 py-2 text-sm text-center text-gray-600">{result.endTermExam || '-'}</td>
                        <td className="px-4 py-2 text-sm text-center font-bold text-blue-600">{result.totalScore}%</td>
                        <td className="px-4 py-2 text-sm text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            result.grade === 'A+' || result.grade === 'A' ? 'bg-green-100 text-green-800' :
                            result.grade === 'B+' || result.grade === 'B' || result.grade === 'B-' ? 'bg-blue-100 text-blue-800' :
                            result.grade === 'C+' || result.grade === 'C' || result.grade === 'C-' ? 'bg-yellow-100 text-yellow-800' :
                            result.grade === 'D' || result.grade === 'E' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {result.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end">
              <button
                onClick={() => approveResults(selectedResult.subjectId, selectedResult.year, selectedResult.term, resultDetails[0]?.subjectName || 'Results')}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 shadow-sm"
              >
                Approve All & Notify Students
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approved Results */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
          <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
            <span>✓</span> Approved & Published Results
          </h3>
          <p className="text-sm text-green-600 mt-1">Results that have been approved and published to students</p>
        </div>
        <div className="p-6">
          {approvedResults.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2"></div>
              <p className="text-gray-500">No approved results yet.</p>
              <p className="text-sm text-gray-400 mt-1">Approved results will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedResults.map((result, idx) => (
                <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="font-semibold text-lg text-gray-800">{result.subjectName}</div>
                  <div className="text-sm text-gray-600 mt-1"> {result.term} {result.year}</div>
                  <div className="text-sm text-gray-500 mt-1"> Students: {result.studentCount}</div>
                  <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <span>✓</span> Approved: {new Date(result.approvedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultsApproval;