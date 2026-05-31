import React, { useState, useEffect } from 'react';

function UserManagement() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('teachers');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    loadTeachers();
    loadStudents();
  }, []);

  const loadTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/admin/teachers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error('Error loading teachers:', error);
      setMessage('❌ Error loading teachers');
      setMessageType('error');
    }
  };

  const loadStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/admin/all-students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
      setMessage('❌ Error loading students');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteTeacher = async (id, name) => {
    if (confirm(`Are you sure you want to delete teacher "${name}"?\n\nThis action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://school-yathu.onrender.com/api/admin/teachers/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          setMessage(`Teacher "${name}" deleted successfully!`);
          setMessageType('success');
          loadTeachers();
        } else {
          const error = await response.json();
          setMessage(`❌ Error: ${error.message || 'Failed to delete teacher'}`);
          setMessageType('error');
        }
      } catch (error) {
        console.error('Error:', error);
        setMessage('❌ Error deleting teacher');
        setMessageType('error');
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (confirm(`⚠️ Are you sure you want to delete student "${name}"?\n\nThis action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://school-yathu.onrender.com/api/admin/students/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          setMessage(`Student "${name}" deleted successfully!`);
          setMessageType('success');
          loadStudents();
        } else {
          const error = await response.json();
          setMessage(`❌ Error: ${error.message || 'Failed to delete student'}`);
          setMessageType('error');
        }
      } catch (error) {
        console.error('Error:', error);
        setMessage('❌ Error deleting student');
        setMessageType('error');
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleResetPassword = async (id, name, type) => {
    if (confirm(`Reset password for ${type} "${name}"?\n\nThey will need to change it on next login.`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://school-yathu.onrender.com/api/auth/reset-password/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        if (response.ok) {
          alert(`Password reset for ${name}\n\n New Password: ${data.newPassword}\n\nUser must change password on next login.`);
          if (type === 'teacher') {
            loadTeachers();
          } else {
            loadStudents();
          }
        } else {
          alert(`❌ Error: ${data.message || 'Failed to reset password'}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('❌ Error resetting password');
      }
    }
  };

  if (loading && teachers.length === 0 && students.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <h2 className="text-2xl font-bold text-white"> User Management</h2>
        <p className="text-blue-100 text-sm mt-1">Manage all system users (Teachers and Students)</p>
      </div>
      
      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-4 py-2 font-semibold transition-all duration-200 ${
              activeTab === 'teachers' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Teachers ({teachers.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 font-semibold transition-all duration-200 ${
              activeTab === 'students' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Students ({students.length})
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-lg mb-4 ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Teachers Table */}
        {activeTab === 'teachers' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      <div className="text-4xl mb-2"></div>
                      No teachers found.
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{teacher.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{teacher.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{teacher.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{teacher.phoneNumber || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{teacher.employeeId || '-'}</td>
                      <td className="px-6 py-4">
                        {teacher.mustChangePassword ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Password Required
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handleResetPassword(teacher.id, teacher.name, 'teacher')}
                          className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
                          title="Reset Password"
                        >
                          Reset Pwd
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                          className="text-red-600 hover:text-red-800 transition-colors text-sm"
                          title="Delete Teacher"
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
        )}

        {/* Students Table */}
        {activeTab === 'students' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stream</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      <div className="text-4xl mb-2"></div>
                      No students found.
                     </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{student.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.admissionNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.class || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.stream || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handleResetPassword(student.id, student.fullName, 'student')}
                          className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
                          title="Reset Password"
                        >
                          Reset Pwd
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id, student.fullName)}
                          className="text-red-600 hover:text-red-800 transition-colors text-sm"
                          title="Delete Student"
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
        )}
      </div>
    </div>
  );
}

export default UserManagement;