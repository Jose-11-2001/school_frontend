import React, { useState, useEffect } from 'react';

function ClassResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [term, setTerm] = useState('Term 1');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadResults();
  }, [year, term]);

  const loadResults = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://school-yathu.onrender.com/api/FormTeacher/class-results-summary?year=${year}&term=${encodeURIComponent(term)}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        setError('Failed to load results');
      }
    } catch (error) {
      console.error('Error loading results:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResults = async (className) => {
    if (!confirm(`Submit results for ${className} (${term} ${year}) to Headteacher for approval?`)) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/FormTeacher/submit-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          className: className,
          year: year,
          term: term
        })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(`✅ ${data.message}`);
        setTimeout(() => setSuccess(''), 5000);
        loadResults();
      } else {
        setError(data.message || 'Failed to submit results');
      }
    } catch (error) {
      console.error('Error submitting results:', error);
      setError('Failed to submit results');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading class results...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">📊 Class Results</h2>
          <p className="text-sm text-gray-500">View and submit class results to Headteacher</p>
        </div>
        <div className="flex gap-2">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="border rounded-lg px-3 py-2"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option>Term 1</option>
            <option>Term 2</option>
            <option>Term 3</option>
          </select>
          <button onClick={loadResults} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Apply
          </button>
        </div>
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

      {results.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No results found for your class.</p>
          <p className="text-sm text-gray-400 mt-1">Enter marks first in the Marks Entry section.</p>
        </div>
      ) : (
        results.map((cls, index) => (
          <div key={index} className="bg-white rounded-lg shadow border mb-6">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{cls.className}</h3>
                  <p className="text-sm text-gray-600">
                    Total Students: {cls.totalStudents} | With Results: {cls.studentsWithResults}
                  </p>
                </div>
                <button
                  onClick={() => handleSubmitResults(cls.className)}
                  disabled={submitting || cls.studentsWithResults === 0}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400 text-sm"
                >
                  {submitting ? 'Submitting...' : '📤 Submit to Headteacher'}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Marks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cls.rankings?.map((student) => (
                    <tr key={student.admissionNumber} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-bold">#{student.position}</td>
                      <td className="px-6 py-4 text-sm font-mono">{student.admissionNumber}</td>
                      <td className="px-6 py-4 text-sm font-medium">{student.fullName}</td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">{student.totalMarks}</td>
                      <td className="px-6 py-4 text-sm">{student.average}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ClassResults;