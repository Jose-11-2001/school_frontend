import React, { useState, useEffect } from 'react';

function AdminUserManagement() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('teachers');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  // Edit states
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Form states for editing
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    employeeId: '',
    qualification: '',
    class: '',
    stream: ''
  });

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
    }
  };

  // ==================== TEACHER CRUD OPERATIONS ====================

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
          setMessage(`Error: ${error.message || 'Failed to delete teacher'}`);
          setMessageType('error');
        }
      } catch (error) {
        console.error('Error:', error);
        setMessage('Error deleting teacher');
        setMessageType('error');
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setEditFormData({
      name: teacher.name || '',
      email: teacher.email || '',
      phoneNumber: teacher.phoneNumber || '',
      employeeId: teacher.employeeId || '',
      qualification: teacher.qualification || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/admin/teachers/${editingTeacher.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });
      
      if (response.ok) {
        setMessage(`Teacher "${editFormData.name}" updated successfully!`);
        setMessageType('success');
        setShowEditModal(false);
        setEditingTeacher(null);
        loadTeachers();
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.message || 'Failed to update teacher'}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error updating teacher');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // ==================== STUDENT CRUD OPERATIONS ====================

  const handleDeleteStudent = async (id, name) => {
    if (confirm(`Are you sure you want to delete student "${name}"?\n\nThis action cannot be undone.`)) {
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
          setMessage(`Error: ${error.message || 'Failed to delete student'}`);
          setMessageType('error');
        }
      } catch (error) {
        console.error('Error:', error);
        setMessage(' Error deleting student');
        setMessageType('error');
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setEditFormData({
      name: student.fullName || '',
      admissionNumber: student.admissionNumber || '',
      class: student.class || '',
      stream: student.stream || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/admin/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: editFormData.name,
          class: editFormData.class,
          stream: editFormData.stream
        })
      });
      
      if (response.ok) {
        setMessage(`Student "${editFormData.name}" updated successfully!`);
        setMessageType('success');
        setShowEditModal(false);
        setEditingStudent(null);
        loadStudents();
      } else {
        const error = await response.json();
        setMessage(` Error: ${error.message || 'Failed to update student'}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(' Error updating student');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // PASSWORD RESET 

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
          alert(`Password reset for ${name}\n\n New Password: ${data.newPassword}\n\n User must change password on next login.`);
          if (type === 'teacher') {
            loadTeachers();
          } else {
            loadStudents();
          }
        } else {
          alert(`Error: ${data.message || 'Failed to reset password'}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error resetting password');
      }
    }
  };

  // MODAL CLOSE

  const closeModal = () => {
    setShowEditModal(false);
    setEditingTeacher(null);
    setEditingStudent(null);
    setEditFormData({
      name: '',
      email: '',
      phoneNumber: '',
      employeeId: '',
      qualification: '',
      class: '',
      stream: ''
    });
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
          messageType === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Teachers Table */}
      {activeTab === 'teachers' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Teacher Accounts</h3>
              <p className="text-gray-600 text-sm mt-1">Manage all teacher accounts - Edit, Delete, Reset Password</p>
            </div>
            <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              Total: {teachers.length}
            </span>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      <div className="text-4xl mb-2"></div>
                      No teachers found. Add your first teacher in Teacher Management tab.
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
                      <td className="px-6 py-4 text-sm text-gray-600">{teacher.qualification || '-'}</td>
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
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleEditTeacher(teacher)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit Teacher"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleResetPassword(teacher.id, teacher.name, 'teacher')}
                          className="text-yellow-600 hover:text-yellow-800 transition-colors"
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
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Student Accounts</h3>
              <p className="text-gray-600 text-sm mt-1">Manage all student accounts - Edit, Delete, Reset Password</p>
            </div>
            <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
              Total: {students.length}
            </span>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      <div className="text-4xl mb-2"></div>
                      No students found. Add your first student in Manage Students tab.
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
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit Student"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleResetPassword(student.id, student.fullName, 'student')}
                          className="text-yellow-600 hover:text-yellow-800 transition-colors"
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingTeacher ? 'Edit Teacher' : 'Edit Student'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={editingTeacher ? handleUpdateTeacher : handleUpdateStudent}>
                {editingTeacher ? (
                  // Teacher Edit Form
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Email *</label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Phone Number</label>
                      <input
                        type="text"
                        value={editFormData.phoneNumber}
                        onChange={(e) => setEditFormData({...editFormData, phoneNumber: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Employee ID</label>
                      <input
                        type="text"
                        value={editFormData.employeeId}
                        onChange={(e) => setEditFormData({...editFormData, employeeId: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Qualification</label>
                      <input
                        type="text"
                        value={editFormData.qualification}
                        onChange={(e) => setEditFormData({...editFormData, qualification: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                ) : (
                  // Student Edit Form
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Admission Number</label>
                      <input
                        type="text"
                        value={editFormData.admissionNumber}
                        className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                        disabled
                      />
                      <p className="text-xs text-gray-400 mt-1">Admission number cannot be changed</p>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Class</label>
                      <input
                        type="text"
                        value={editFormData.class}
                        onChange={(e) => setEditFormData({...editFormData, class: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Form 3"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Stream</label>
                      <input
                        type="text"
                        value={editFormData.stream}
                        onChange={(e) => setEditFormData({...editFormData, stream: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., East"
                      />
                    </div>
                  </>
                )}
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    {loading ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUserManagement;