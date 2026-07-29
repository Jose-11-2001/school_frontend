import React, { useState, useEffect } from 'react';
import { adminAPI, authAPI } from '../../services/api';

function AdminUserManagement() {
  const [allUsers, setAllUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    employeeId: '',
    qualification: ''
  });

  useEffect(() => {
    loadAllUsers();
    loadTeachers();
    loadStudents();
  }, []);

  const loadAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/Users/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data);
      } else {
        console.error('Failed to load users:', response.status);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage('Error loading users');
      setMessageType('error');
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await adminAPI.getTeachers();
      setTeachers(response.data);
    } catch (error) {
      console.error('Error loading teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await adminAPI.getAllStudents();
      setStudents(response.data);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handleDeleteUser = async (id, name, role) => {
    if (confirm(`Are you sure you want to delete ${role} "${name}"?\n\nThis action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://school-yathu.onrender.com/api/Users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          setMessage(`${role} "${name}" deleted successfully!`);
          setMessageType('success');
          loadAllUsers();
          loadTeachers();
          loadStudents();
        } else {
          const data = await response.json();
          setMessage(`Error: ${data.message || 'Failed to delete user'}`);
          setMessageType('error');
        }
      } catch (error) {
        console.error('Error:', error);
        setMessage('Failed to delete user');
        setMessageType('error');
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      employeeId: user.employeeId || '',
      qualification: user.qualification || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/Users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        setMessage(`User "${editFormData.name}" updated successfully!`);
        setMessageType('success');
        setShowEditModal(false);
        setEditingUser(null);
        loadAllUsers();
        loadTeachers();
        loadStudents();
      } else {
        const data = await response.json();
        setMessage(`Error: ${data.message || 'Failed to update user'}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to update user');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleResetPassword = async (id, name, role) => {
    if (confirm(`Reset password for ${role} "${name}"?\n\nThey will need to change it on next login.`)) {
      try {
        const response = await authAPI.resetPassword(id);
        alert(`Password reset for ${name}\n\nNew Password: ${response.data.newPassword}\n\nUser must change password on next login.`);
        loadAllUsers();
        loadTeachers();
        loadStudents();
      } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.response?.data?.message || 'Failed to reset password'}`);
      }
    }
  };

  const closeModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setEditFormData({
      name: '',
      email: '',
      phoneNumber: '',
      employeeId: '',
      qualification: ''
    });
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      'Admin': 'bg-purple-100 text-purple-800',
      'DeputyHeadTeacher': 'bg-blue-100 text-blue-800',
      'HeadOfDepartment': 'bg-green-100 text-green-800',
      'FormTeacher': 'bg-cyan-100 text-cyan-800',
      'Teacher': 'bg-indigo-100 text-indigo-800',
      'Student': 'bg-yellow-100 text-yellow-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  // Filter users based on search and role
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  // Get unique roles for filter
  const uniqueRoles = [...new Set(allUsers.map(u => u.role))];

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
          <p className="text-sm text-gray-500 mt-1">Manage all users in the system</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'all' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Users ({allUsers.length})
          </button>
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

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* All Users Table */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">All Users</h3>
              <p className="text-gray-600 text-sm mt-1">Manage all user accounts - Edit, Delete, Reset Password</p>
            </div>
            <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              Total: {filteredUsers.length}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{user.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.phoneNumber || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.employeeId || '-'}</td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        {user.role !== 'Admin' && (
                          <>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Edit User"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleResetPassword(user.id, user.name, user.role)}
                              className="text-yellow-600 hover:text-yellow-800 transition-colors"
                              title="Reset Password"
                            >
                              Reset
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name, user.role)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete User"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {user.role === 'Admin' && (
                          <span className="text-xs text-gray-400">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teachers Tab - Reuse existing teacher table */}
      {activeTab === 'teachers' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Teacher Accounts</h3>
              <p className="text-gray-600 text-sm mt-1">Manage all teacher accounts</p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
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
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleEditUser(teacher)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleResetPassword(teacher.id, teacher.name, 'Teacher')}
                          className="text-yellow-600 hover:text-yellow-800 transition-colors"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => handleDeleteUser(teacher.id, teacher.name, 'Teacher')}
                          className="text-red-600 hover:text-red-800 transition-colors"
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

      {/* Students Tab - Reuse existing student table */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Student Accounts</h3>
              <p className="text-gray-600 text-sm mt-1">Manage all student accounts</p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
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
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleEditUser(student)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleResetPassword(student.id, student.fullName, 'Student')}
                          className="text-yellow-600 hover:text-yellow-800 transition-colors"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => handleDeleteUser(student.id, student.fullName, 'Student')}
                          className="text-red-600 hover:text-red-800 transition-colors"
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
                  Edit {editingUser?.role || 'User'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleUpdateUser}>
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