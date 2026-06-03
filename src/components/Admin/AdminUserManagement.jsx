import React, { useState, useEffect } from 'react';

function AdminUserManagement() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('teachers');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

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
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (id, name) => {
    if (confirm(` Are you sure you want to delete teacher "${name}"?\n\nThis action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://school-yathu.onrender.com/api/admin/teachers/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          setMessage(` Teacher "${name}" deleted successfully!`);
          loadTeachers();
          setTimeout(() => setMessage(''), 3000);
        } else {
          const error = await response.json();
          setMessage(`❌ Error: ${error.message || 'Failed to delete teacher'}`);
          setTimeout(() => setMessage(''), 3000);
        }
      } catch (error) {
        console.error('Error:', error);
        setMessage('❌ Error deleting teacher');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (confirm(` Are you sure you want to delete student "${name}"?\n\nThis action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://school-yathu.onrender.com/api/admin/students/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          setMessage(` Student "${name}" deleted successfully!`);
          loadStudents();
          setTimeout(() => setMessage(''), 3000);
        } else {
          const error = await response.json();
          setMessage(`❌ Error: ${error.message || 'Failed to delete student'}`);
          setTimeout(() => setMessage(''), 3000);
        }
      } catch (error) {
        console.error('Error:', error);
        setMessage('❌ Error deleting student');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const handleResetPassword = async (id, name, type) => {
    if (confirm(` Reset password for ${type} "${name}"?\n\nThey will need to change it on next login.`)) {
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
          alert(` Password reset for ${name}\n\n New Password: ${data.newPassword}\n\nUser must change password on next login.`);
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

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading users...</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all teacher and student accounts</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'teachers' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
             Teachers ({teachers.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'students' 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
             Students ({students.length})
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg mb-4 ${
          message.includes('') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Teachers Table */}
      {activeTab === 'teachers' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800"> Teacher Accounts</h3>
            <p className="text-gray-600 text-sm mt-1">Manage all teacher accounts</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      <div className="text-4xl mb-2"></div>
                      No teachers found. Add your first teacher in Teacher Management tab.
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{teacher.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{teacher.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{teacher.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{teacher.phoneNumber || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{teacher.employeeId || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{teacher.qualification || '-'}</td>
                      <td className="px-6 py-4 text-sm space-x-3">
                        <button
                          onClick={() => handleResetPassword(teacher.id, teacher.name, 'teacher')}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Reset Password"
                        >
                          Reset Pwd
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                          className="text-red-600 hover:text-red-800 transition-colors"
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
        </div>
      )}

      {/* Students Table */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">👨‍🎓 Student Accounts</h3>
            <p className="text-gray-600 text-sm mt-1">Manage all student accounts</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stream</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      <div className="text-4xl mb-2">👨‍🎓</div>
                      No students found. Add your first student in Manage Students tab.
                     </td>
                   </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{student.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.admissionNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.class || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.stream || '-'}</td>
                      <td className="px-6 py-4 text-sm space-x-3">
                        <button
                          onClick={() => handleResetPassword(student.id, student.fullName, 'student')}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Reset Password"
                        >
                          Reset Pwd
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id, student.fullName)}
                          className="text-red-600 hover:text-red-800 transition-colors"
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
        </div>
      )}
    </div>
  );
}

export default AdminUserManagement;