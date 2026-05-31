import React, { useState, useEffect } from 'react';

function AdminUserManagement() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('teachers');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeachers();
    loadStudents();
  }, []);

  const loadTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5123/api/admin/teachers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5123/api/admin/all-students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (id, name) => {
    if (confirm(`Are you sure you want to delete teacher "${name}"?`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5123/api/admin/teachers/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          alert('Teacher deleted successfully!');
          loadTeachers();
        } else {
          const error = await response.json();
          alert('Error: ' + (error.message || 'Failed to delete teacher'));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting teacher');
      }
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (confirm(`Are you sure you want to delete student "${name}"?`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5123/api/admin/students/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          alert('Student deleted successfully!');
          loadStudents();
        } else {
          const error = await response.json();
          alert('Error: ' + (error.message || 'Failed to delete student'));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting student');
      }
    }
  };

  const handleResetPassword = async (id, name, type) => {
    if (confirm(`Reset password for ${type} "${name}"? They will need to change it on next login.`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5123/api/auth/reset-password/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        if (response.ok) {
          alert(`Password reset for ${name}\n\nNew Password: ${data.newPassword}\n\nUser must change password on next login.`);
          if (type === 'teacher') {
            loadTeachers();
          } else {
            loadStudents();
          }
        } else {
          alert('❌ Error: ' + (data.message || 'Failed to reset password'));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('❌ Error resetting password');
      }
    }
  };

  if (loading) return <div className="text-center py-8">Loading users...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'teachers' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Teachers ({teachers.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'students' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            👨‍🎓 Students ({students.length})
          </button>
        </div>
      </div>

      {/* Teachers Table */}
      {activeTab === 'teachers' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-800">Teacher Accounts</h3>
            <p className="text-gray-600 mt-1">Manage all teacher accounts</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qualification</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No teachers found. Add your first teacher in Teacher Management tab.
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{teacher.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{teacher.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{teacher.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{teacher.phoneNumber || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{teacher.employeeId || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{teacher.qualification || '-'}</td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleResetPassword(teacher.id, teacher.name, 'teacher')}
                          className="text-blue-600 hover:text-blue-800"
                          title="Reset Password"
                        >
                          Reset Pwd
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Students Table */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-800">Student Accounts</h3>
            <p className="text-gray-600 mt-1">Manage all student accounts</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stream</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No students found. Add your first student in Manage Students tab.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{student.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.admissionNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.class || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.stream || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleResetPassword(student.id, student.fullName, 'student')}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                          title="Reset Password"
                        >
                          Reset Pwd
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id, student.fullName)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUserManagement;