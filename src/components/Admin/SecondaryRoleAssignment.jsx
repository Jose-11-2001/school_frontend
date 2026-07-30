// components/Admin/SecondaryRoleAssignment.jsx
import React, { useState, useEffect } from 'react';

function SecondaryRoleAssignment() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const availableRoles = [
    'Teacher',
    'FormTeacher',
    'HeadOfDepartment',
    'DeputyHeadTeacher'
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/Users/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (userId) => {
    setSelectedUser(userId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/Admin/user-roles/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedRoles(data.secondaryRoles || []);
      }
    } catch (error) {
      console.error('Error loading user roles:', error);
    }
  };

  const handleAssignRoles = async () => {
    if (!selectedUser) {
      setMessage('Please select a user');
      setMessageType('error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/Admin/assign-secondary-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: parseInt(selectedUser),
          secondaryRoles: selectedRoles
        })
      });

      if (response.ok) {
        setMessage('Secondary roles assigned successfully!');
        setMessageType('success');
        loadUsers();
      } else {
        const data = await response.json();
        setMessage(data.message || 'Failed to assign roles');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error assigning roles:', error);
      setMessage('Network error');
      setMessageType('error');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const toggleRole = (role) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Secondary Role Assignment</h2>
      <p className="text-sm text-gray-500 mb-6">
        Assign additional roles to users. They will have privileges of all assigned roles.
      </p>

      {message && (
        <div className={`p-3 rounded-lg mb-4 ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">Select User</label>
          <select
            value={selectedUser}
            onChange={(e) => handleUserSelect(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select User --</option>
            {users.filter(u => u.role !== 'Admin').map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email}) - {user.role}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">Secondary Roles</label>
          <div className="space-y-2">
            {availableRoles.map((role) => (
              <label key={role} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role)}
                  onChange={() => toggleRole(role)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">{role}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleAssignRoles}
        disabled={!selectedUser}
        className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
      >
        Assign Secondary Roles
      </button>

      <div className="mt-6">
        <h3 className="font-semibold text-gray-700 mb-2">Users with Secondary Roles</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Primary Role</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Secondary Roles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.filter(u => u.secondaryRoles).map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">{user.name}</td>
                  <td className="px-4 py-2 text-sm">{user.role}</td>
                  <td className="px-4 py-2 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {user.secondaryRoles.split(',').map((role, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                          {role.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {users.filter(u => u.secondaryRoles).length === 0 && (
                <tr>
                  <td colSpan="3" className="px-4 py-4 text-center text-gray-500">
                    No users with secondary roles assigned.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SecondaryRoleAssignment;