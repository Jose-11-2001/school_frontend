import React, { useState } from 'react';

function SchoolRankings() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [term, setTerm] = useState('Term 1');
  const [rankings, setRankings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRankings = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://school-yathu.onrender.com/api/Rankings/school-rankings?year=${year}&term=${encodeURIComponent(term)}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setRankings(data);
      } else {
        setError('Failed to load rankings');
      }
    } catch (error) {
      console.error('Error fetching rankings:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (performance) => {
    switch(performance) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Average': return 'bg-yellow-100 text-yellow-800';
      case 'Poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">School Rankings</h2>
          <p className="text-sm text-gray-500 mt-1">Overall department performance ranking</p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2024, 2025, 2026, 2027, 2028].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Term</label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchRankings}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Loading...' : 'View Rankings'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 mb-4">
          {error}
        </div>
      )}

      {rankings && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
            <h3 className="text-xl font-bold text-gray-800">School Performance Overview</h3>
            <p className="text-sm text-gray-600">
              {rankings.term} {rankings.year} | Total Departments: {rankings.totalDepartments}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subjects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rankings.rankings?.map((dept, index) => (
                  <tr key={index} className={index < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 text-sm font-bold">#{dept.position}</td>
                    <td className="px-6 py-4 text-sm font-medium">{dept.departmentName}</td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-600">{dept.averageScore}%</td>
                    <td className="px-6 py-4 text-sm">{dept.totalStudents}</td>
                    <td className="px-6 py-4 text-sm">{dept.totalSubjects}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(dept.performance)}`}>
                        {dept.performance}
                      </span>
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

export default SchoolRankings;