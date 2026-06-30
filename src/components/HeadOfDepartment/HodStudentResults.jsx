import React, { useState, useEffect } from 'react';

function HodStudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [term, setTerm] = useState('Term 1');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadResults();
  }, [year, term]);

  const loadResults = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://school-yathu.onrender.com/api/HeadOfDepartment/department-student-results?year=${year}&term=${encodeURIComponent(term)}`,
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

  const getGradeColor = (grade) => {
    const colors = {
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'E': 'bg-red-100 text-red-800',
      'F': 'bg-red-200 text-red-900'
    };
    return colors[grade] || 'bg-gray-100 text-gray-800';
  };

  const filteredResults = filter 
    ? results.filter(r => r.subjectName?.toLowerCase().includes(filter.toLowerCase()) || 
                          r.studentName?.toLowerCase().includes(filter.toLowerCase()))
    : results;

  if (loading) {
    return <div className="text-center py-8">Loading results...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">📈 Student Results</h2>
          <p className="text-sm text-gray-500">View all student results in this department</p>
        </div>
        <button
          onClick={loadResults}
          className="text-blue-500 hover:text-blue-700"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="border rounded-lg px-3 py-2"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1">Term</label>
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option>Term 1</option>
            <option>Term 2</option>
            <option>Term 3</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-gray-700 text-sm font-semibold mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by student or subject..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <button
          onClick={loadResults}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Apply
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 mb-4">
          {error}
        </div>
      )}

      {filteredResults.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No results found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResults.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">{result.admissionNumber}</td>
                    <td className="px-6 py-4 text-sm font-medium">{result.studentName}</td>
                    <td className="px-6 py-4 text-sm">{result.subjectName}</td>
                    <td className="px-6 py-4 text-sm font-bold">
                      {result.totalScore !== null ? `${result.totalScore}%` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {result.grade && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">{result.term} {result.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t text-sm text-gray-500">
            Showing {filteredResults.length} results
          </div>
        </div>
      )}
    </div>
  );
}

export default HodStudentResults;