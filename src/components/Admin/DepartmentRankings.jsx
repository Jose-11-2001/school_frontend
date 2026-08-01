import React, { useState, useEffect } from 'react';

function DepartmentRankings() {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [term, setTerm] = useState('Term 1');
  const [rankings, setRankings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/Admin/departments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
        if (data.length > 0) {
          setSelectedDepartment(data[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const fetchRankings = async () => {
    if (!selectedDepartment) {
      setError('Please select a department');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://school-yathu.onrender.com/api/Rankings/department-rankings?departmentId=${selectedDepartment}&year=${year}&term=${encodeURIComponent(term)}`,
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
          <h2 className="text-2xl font-bold text-gray-800">Department Rankings</h2>
          <p className="text-sm text-gray-500 mt-1">Rank subject performance within departments</p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Select Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Department --</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.subjectCount} subjects)
                </option>
              ))}
            </select>
          </div>
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
              disabled={loading || !selectedDepartment}
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
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-gray-800">{rankings.departmentName}</h3>
            <p className="text-sm text-gray-600">
              {rankings.term} {rankings.year} | Total Subjects: {rankings.totalSubjects}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rankings.rankings?.map((subject, index) => (
                  <tr key={index} className={index < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 text-sm font-bold">#{subject.position}</td>
                    <td className="px-6 py-4 text-sm font-medium">{subject.subjectName}</td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-600">{subject.average?.toFixed(2)}%</td>
                    <td className="px-6 py-4 text-sm">{subject.totalMarks}</td>
                    <td className="px-6 py-4 text-sm">{subject.studentCount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(subject.performance)}`}>
                        {subject.performance}
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

export default DepartmentRankings;