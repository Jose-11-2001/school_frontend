import React, { useState, useEffect } from 'react';

function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
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
      const response = await fetch('https://school-yathu.onrender.com/api/admin/teachers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error('Error loading teachers:', error);
      setMessage('❌ Error loading teachers');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
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
    // For teachers, use first initial + last name format
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      const firstNameInitial = parts[0].substring(0, 1);
      const lastName = parts[parts.length - 1];
      return `${firstNameInitial}${lastName}@gmail.com`.toLowerCase();
    }
    return `${cleanName}@gmail.com`.toLowerCase();
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
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/admin/teachers', {
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
        setMessage(`Teacher added successfully!\n\n Email: ${formData.email}\nPassword: ${formData.password}\n\n⚠️ Teacher must change password on first login.`);
        setMessageType('success');
        setShowAddForm(false);
        setFormData({ email: '', name: '', password: '', phoneNumber: '', employeeId: '', qualification: '', hireDate: '' });
        setGeneratedPassword('');
        loadTeachers();
      } else {
        const error = await response.json();
        setMessage(`❌ Error: ${error.message || 'Failed to add teacher'}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error adding teacher');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 5000);
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

  const handleResetPassword = async (id, name) => {
    if (confirm(` Reset password for teacher "${name}"?\n\nThey will need to change it on next login.`)) {
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
          alert(` Password reset for ${name}\n\n New Password: ${data.newPassword}\n\n Teacher must change password on next login.`);
          loadTeachers();
        } else {
          alert(`❌ Error: ${data.message || 'Failed to reset password'}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('❌ Error resetting password');
      }
    }
  };

  if (loading && teachers.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Teacher Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all teacher accounts</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md flex items-center gap-2"
        >
          <span className="text-lg">+</span> Add New Teacher
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg mb-4 whitespace-pre-line ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {showAddForm && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 border border-blue-200 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <span></span> Add New Teacher
          </h3>
          <form onSubmit={handleAddTeacher} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-1 text-sm font-semibold">Full Name *</label>
              <input
                type="text"
                placeholder="Full Name (e.g., John Mbukwa)"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Email will be auto-generated from name (e.g., jmbukwa@gmail.com)</p>
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm font-semibold">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 w-full"
                required
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm font-semibold">Password *</label>
              <input
                type="text"
                value={formData.password}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 w-full font-mono"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated 8-character password</p>
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm font-semibold">Phone Number</label>
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm font-semibold">Employee ID</label>
              <input
                type="text"
                placeholder="Employee ID (e.g., TCH001)"
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm font-semibold">Qualification</label>
              <input
                type="text"
                placeholder="Qualification (e.g., Degree in Education)"
                value={formData.qualification}
                onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm font-semibold">Hire Date</label>
              <input
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
                 Save Teacher
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition-colors">
                Cancel
              </button>
            </div>
          </form>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800 flex items-center gap-2">
              <span>ℹ</span> Teacher will receive auto-generated email and password. They must change password on first login.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    <div className="text-4xl mb-2"></div>
                    No teachers found. Click "Add New Teacher" to create your first teacher.
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">{teacher.employeeId || '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{teacher.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{teacher.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{teacher.phoneNumber || '-'}</td>
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
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => handleResetPassword(teacher.id, teacher.name)}
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
      </div>
    </div>
  );
}

export default TeacherManagement;