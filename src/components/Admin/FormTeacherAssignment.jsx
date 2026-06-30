import React, { useState, useEffect } from 'react';

function FormTeacherAssignment() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Load classes
      const classesRes = await fetch('https://school-yathu.onrender.com/api/Admin/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (classesRes.ok) {
        const data = await classesRes.json();
        setClasses(data);
      }

      // Load teachers
      const teachersRes = await fetch('https://school-yathu.onrender.com/api/Admin/teachers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (teachersRes.ok) {
        const data = await teachersRes.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignFormTeacher = async () => {
    if (!selectedClass || !selectedTeacher) {
      setError('Please select both a class and a teacher');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/Admin/assign-form-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          classId: parseInt(selectedClass),
          teacherId: parseInt(selectedTeacher)
        })
      });

      if (response.ok) {
        setSuccess('✅ Form teacher assigned successfully!');
        loadData();
        setSelectedClass('');
        setSelectedTeacher('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to assign form teacher');
      }
    } catch (error) {
      console.error('Error assigning form teacher:', error);
      setError('Network error');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading data...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">👨‍🏫 Form Teacher Assignment</h2>
          <p className="text-sm text-gray-500">Assign form teachers to classes</p>
        </div>
        <button onClick={loadData} className="text-blue-500 hover:text-blue-700">
          🔄 Refresh
        </button>
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

      <div className="bg-gray-50 p-4 rounded-lg border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Class *</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">-- Select Class --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.stream || ''} - Current: {cls.formTeacherName || 'Not Assigned'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Select Teacher *</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} - {teacher.departmentName || 'No Department'}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleAssignFormTeacher}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Assign Form Teacher
          </button>
        </div>
      </div>

      {/* Current Assignments */}
      <h3 className="font-semibold text-lg mb-3">Current Form Teacher Assignments</h3>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stream</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Form Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classes.filter(c => c.formTeacherId).length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No form teachers assigned yet.
                </td>
              </tr>
            ) : (
              classes.filter(c => c.formTeacherId).map((cls) => (
                <tr key={cls.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{cls.name}</td>
                  <td className="px-6 py-4 text-sm">{cls.stream || '-'}</td>
                  <td className="px-6 py-4 text-sm">{cls.formTeacherName}</td>
                  <td className="px-6 py-4 text-sm">{cls.studentCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FormTeacherAssignment;