import React, { useState, useEffect } from 'react';

function FormTeacherStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    loadClasses();
    loadStudents();
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
          setSelectedClass(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const url = selectedClass 
        ? `https://school-yathu.onrender.com/api/FormTeacher/my-students?classId=${selectedClass}`
        : 'https://school-yathu.onrender.com/api/FormTeacher/my-students';
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        setError('Failed to load students');
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    }
  }, [selectedClass]);

  if (loading) {
    return <div className="text-center py-8">Loading students...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">👨‍🎓 My Students</h2>
          <p className="text-sm text-gray-500">Students in your assigned classes</p>
        </div>
        <button onClick={loadStudents} className="text-blue-500 hover:text-blue-700">
          🔄 Refresh
        </button>
      </div>

      {classes.length > 0 && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full max-w-xs"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} {cls.stream || ''} ({cls.studentCount} students)
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 mb-4">
          {error}
        </div>
      )}

      {students.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No students found in your classes.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stream</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending Selections</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Has Results</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">{student.admissionNumber}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.fullName}</td>
                    <td className="px-6 py-4 text-sm">{student.class}</td>
                    <td className="px-6 py-4 text-sm">{student.stream || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      {student.subjectSelections > 0 ? (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                          {student.subjectSelections} pending
                        </span>
                      ) : (
                        <span className="text-green-500">✓</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {student.hasResults ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">✅</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t text-sm text-gray-500">
            Showing {students.length} students
          </div>
        </div>
      )}
    </div>
  );
}

export default FormTeacherStudents;