import React, { useState, useEffect } from 'react';

function ClassRankings() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [term, setTerm] = useState('Term 1');
  const [rankings, setRankings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/FormTeacher/my-classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass(data[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const fetchRankings = async () => {
    if (!selectedClass) {
      setError('Please select a class');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://school-yathu.onrender.com/api/Rankings/class-rankings?classId=${selectedClass}&year=${year}&term=${encodeURIComponent(term)}`,
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

  const getGradeColor = (grade) => {
    if (!grade) return 'bg-gray-100 text-gray-800';
    if (grade.includes('A')) return 'bg-green-100 text-green-800';
    if (grade.includes('B')) return 'bg-blue-100 text-blue-800';
    if (grade.includes('C')) return 'bg-yellow-100 text-yellow-800';
    if (grade.includes('D')) return 'bg-orange-100 text-orange-800';
    if (grade.includes('E') || grade.includes('F')) return 'bg-red-100 text-red-800';
    if (grade.includes('point')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Class Rankings</h2>
          <p className="text-sm text-gray-500 mt-1">Rank students based on performance in your class</p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Class --</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.stream || ''} ({cls.studentCount} students)
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
              disabled={loading || !selectedClass}
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
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-gray-800">
              {rankings.className} {rankings.stream || ''}
            </h3>
            <p className="text-sm text-gray-600">
              {rankings.term} {rankings.year} | Total Students: {rankings.totalStudents} | With Results: {rankings.studentsWithResults}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subjects</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rankings.rankings?.map((student, index) => (
                  <tr key={index} className={index < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 text-sm font-bold">#{student.position}</td>
                    <td className="px-6 py-4 text-sm font-mono">{student.admissionNumber}</td>
                    <td className="px-6 py-4 text-sm font-medium">{student.fullName}</td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-600">{student.totalMarks}</td>
                    <td className="px-6 py-4 text-sm">{student.average}%</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(student.grade)}`}>
                        {student.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{student.subjectCount}</td>
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

export default ClassRankings;