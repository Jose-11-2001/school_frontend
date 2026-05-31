import React, { useState, useEffect } from 'react';

function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    phoneNumber: '',
    employeeId: '',
    qualification: '',
    hireDate: ''
  });

  useEffect(() => {
    loadTeachers();
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
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const generateEmailFromName = (name) => {
    const cleanName = name.toLowerCase().replace(/\s/g, '');
    return `${cleanName}@gmail.com`;
  };

  const handleNameChange = (name) => {
    setFormData({...formData, name: name});
    if (name) {
      const email = generateEmailFromName(name);
      const password = generateRandomPassword();
      setFormData(prev => ({...prev, email: email, password: password}));
      setGeneratedPassword(password);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5123/api/admin/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          employeeId: formData.employeeId,
          qualification: formData.qualification,
          hireDate: formData.hireDate
        })
      });
      
      if (response.ok) {
        alert(`Teacher added successfully!\n\nEmail: ${formData.email}\nPassword: ${formData.password}\n\nTeacher must change password on first login.`);
        setShowAddForm(false);
        setFormData({ email: '', name: '', password: '', phoneNumber: '', employeeId: '', qualification: '', hireDate: '' });
        setGeneratedPassword('');
        loadTeachers();
      } else {
        const error = await response.json();
        alert('❌ Error: ' + (error.message || 'Failed to add teacher'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error adding teacher');
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
          alert('❌ Error: ' + (error.message || 'Failed to delete teacher'));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('❌ Error deleting teacher');
      }
    }
  };

  const handleResetPassword = async (id, name) => {
    if (confirm(`Reset password for teacher "${name}"? They will need to change it on next login.`)) {
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
          alert(` Password reset for ${name}\n\nNew Password: ${data.newPassword}\n\n Teacher must change password on next login.`);
          loadTeachers();
        } else {
          alert('❌ Error: ' + (data.message || 'Failed to reset password'));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('❌ Error resetting password');
      }
    }
  };

  if (loading) return <div className="text-center py-8">Loading teachers...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Teacher Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          + Add New Teacher
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Add New Teacher</h3>
          <form onSubmit={handleAddTeacher} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-gray-700 mb-1 text-sm font-semibold">Full Name *</label>
              <input
                type="text"
                placeholder="Full Name (e.g., John Mbukwa)"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="px-3 py-2 border rounded w-full"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Email will be auto-generated from name</p>
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm font-semibold">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="px-3 py-2 border rounded w-full"
                required
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm font-semibold">Password *</label>
              <input
                type="text"
                value={formData.password}
                className="px-3 py-2 border rounded w-full bg-gray-100"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated password</p>
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm font-semibold">Phone Number</label>
              <input
                type="text"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="px-3 py-2 border rounded w-full"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm font-semibold">Employee ID</label>
              <input
                type="text"
                placeholder="Employee ID"
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                className="px-3 py-2 border rounded w-full"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm font-semibold">Qualification</label>
              <input
                type="text"
                placeholder="Qualification"
                value={formData.qualification}
                onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                className="px-3 py-2 border rounded w-full"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm font-semibold">Hire Date</label>
              <input
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                className="px-3 py-2 border rounded w-full"
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Save Teacher</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
            </div>
          </form>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800"> Note: Teacher will receive auto-generated email and password. They must change password on first login.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qualification</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td className="px-6 py-4">{teacher.employeeId || '-'}</td>
                  <td className="px-6 py-4 font-medium">{teacher.name}</td>
                  <td className="px-6 py-4">{teacher.email}</td>
                  <td className="px-6 py-4">{teacher.phoneNumber || '-'}</td>
                  <td className="px-6 py-4">{teacher.qualification || '-'}</td>
                  <td className="px-6 py-4">
                    {teacher.mustChangePassword ? (
                      <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">Password Required</span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">Active</span>
                    )}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => handleResetPassword(teacher.id, teacher.name)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      title="Reset Password"
                    >
                      Reset Pwd
                    </button>
                    <button
                      onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TeacherManagement;