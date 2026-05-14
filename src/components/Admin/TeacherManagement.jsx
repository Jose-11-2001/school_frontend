import React, { useState, useEffect } from 'react';

function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
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
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Teacher added successfully!');
        setShowAddForm(false);
        setFormData({ email: '', name: '', password: '', phoneNumber: '', employeeId: '', qualification: '', hireDate: '' });
        loadTeachers();
      } else {
        const error = await response.json();
        alert('Error: ' + (error.message || 'Failed to add teacher'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding teacher');
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
            <input
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Full Name *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="password"
              placeholder="Password *"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Employee ID"
              value={formData.employeeId}
              onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Qualification"
              value={formData.qualification}
              onChange={(e) => setFormData({...formData, qualification: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <input
              type="date"
              placeholder="Hire Date"
              value={formData.hireDate}
              onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Save</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qualification</th>
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
                  <button
                    onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                    className="text-red-600 hover:text-red-800"
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
  );
}

export default TeacherManagement;