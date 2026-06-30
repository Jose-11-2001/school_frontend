import React, { useState, useEffect } from 'react';

function HeadOfDepartmentAssignment() {
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Load departments
      const deptRes = await fetch('https://school-yathu.onrender.com/api/Admin/departments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(data);
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

  const handleAssignHOD = async () => {
    if (!selectedDepartment || !selectedTeacher) {
      setError('Please select both a department and a teacher');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/Admin/assign-head-of-department', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          departmentId: parseInt(selectedDepartment),
          teacherId: parseInt(selectedTeacher)
        })
      });

      if (response.ok) {
        setSuccess('✅ Head of Department assigned successfully!');
        loadData();
        setSelectedDepartment('');
        setSelectedTeacher('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to assign Head of Department');
      }
    } catch (error) {
      console.error('Error assigning HOD:', error);
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
          <h2 className="text-2xl font-bold">👔 Head of Department Assignment</h2>
          <p className="text-sm text-gray-500">Assign Heads of Departments</p>
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
            <label className="block text-sm font-medium mb-1">Select Department *</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">-- Select Department --</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} - Current: {dept.headName || 'Not Assigned'}
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
            onClick={handleAssignHOD}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Assign Head of Department
          </button>
        </div>
      </div>

      {/* Current Assignments */}
      <h3 className="font-semibold text-lg mb-3">Current Heads of Department</h3>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Head of Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teachers</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subjects</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {departments.filter(d => d.headOfDepartmentId).length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No Heads of Department assigned yet.
                </td>
              </tr>
            ) : (
              departments.filter(d => d.headOfDepartmentId).map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{dept.name}</td>
                  <td className="px-6 py-4 text-sm">{dept.headName}</td>
                  <td className="px-6 py-4 text-sm">{dept.teacherCount}</td>
                  <td className="px-6 py-4 text-sm">{dept.subjectCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HeadOfDepartmentAssignment;