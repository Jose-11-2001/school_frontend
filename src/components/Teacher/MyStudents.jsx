
import React, { useState, useEffect } from 'react';

function MyStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5123/api/TeacherMarks/my-students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load students');
      }
      
      const data = await response.json();
      console.log('Students loaded:', data);
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
      setError('No students found. Make sure you are allocated to a class and have students.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading your students...</div>;
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">{error}</p>
        <button 
          onClick={loadStudents}
 className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No students assigned to you yet.</p>
        <p className="text-sm text-gray-400 mt-2">Ask the admin to allocate subjects to your class.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-2xl font-bold text-gray-800">My Students</h2>
        <p className="text-gray-600 mt-1">Total Students: {students.length}</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.admissionNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{student.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.className || student.class || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MyStudents;