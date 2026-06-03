import React, { useState, useEffect } from 'react';

function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    stream: '',
    teacherId: '',
    capacity: ''
  });

  useEffect(() => {
    loadClasses();
    loadTeachers();
  }, []);

  const loadClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/admin/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Classes loaded:', data);
      setClasses(data);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/admin/teachers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Teachers loaded:', data);
      setTeachers(data.filter(t => t.isActive !== false));
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/admin/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          stream: formData.stream,
          teacherId: formData.teacherId ? parseInt(formData.teacherId) : null,
          capacity: formData.capacity ? parseInt(formData.capacity) : null
        })
      });
      
      if (response.ok) {
        setMessage('✅ Class added successfully!');
        setShowAddForm(false);
        setFormData({ name: '', stream: '', teacherId: '', capacity: '' });
        loadClasses();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await response.json();
        setMessage(`❌ Error: ${error.message || 'Failed to add class'}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error adding class');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    
    console.log('Updating class with data:', {
      id: editingClass.id,
      name: formData.name,
      stream: formData.stream,
      teacherId: formData.teacherId,
      capacity: formData.capacity
    });
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/admin/classes/${editingClass.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          stream: formData.stream,
          teacherId: formData.teacherId ? parseInt(formData.teacherId) : null,
          capacity: formData.capacity ? parseInt(formData.capacity) : null
        })
      });
      
      const data = await response.json();
      console.log('Update response:', data);
      
      if (response.ok) {
        setMessage(' Class updated successfully!');
        setEditingClass(null);
        setFormData({ name: '', stream: '', teacherId: '', capacity: '' });
        loadClasses();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ Error: ${data.message || 'Failed to update class'}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(`❌ Error updating class: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteClass = async (id, name) => {
    if (confirm(` Are you sure you want to delete class "${name}"?\n\nThis action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://school-yathu.onrender.com/api/admin/classes/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          setMessage(` Class "${name}" deleted successfully!`);
          loadClasses();
          setTimeout(() => setMessage(''), 3000);
        } else {
          const error = await response.json();
          setMessage(`❌ Error: ${error.message || 'Failed to delete class'}`);
          setTimeout(() => setMessage(''), 3000);
        }
      } catch (error) {
        console.error('Error:', error);
        setMessage('❌ Error deleting class');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const startEdit = (cls) => {
    console.log('Editing class:', cls);
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      stream: cls.stream || '',
      teacherId: cls.teacherId || '',
      capacity: cls.capacity || ''
    });
  };

  const cancelEdit = () => {
    setEditingClass(null);
    setFormData({ name: '', stream: '', teacherId: '', capacity: '' });
  };

  const getTeacherName = (teacherId) => {
    if (!teacherId) return 'Not Assigned';
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Not Assigned';
  };

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading classes...</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800"> Class Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all classes, streams, and class teachers</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-blue-900 to-green-600 text-white px-5 py-2 rounded-lg hover:from-blue-800 hover:to-blue-800 transition-all duration-200 shadow-md flex items-center gap-2"
        >
          <span className="text-lg"></span> Add New Class
        </button>
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

      {showAddForm && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 border border-blue-200 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <span></span> Add New Class
          </h3>
          <form onSubmit={handleAddClass} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Class Name * (e.g., Form 1, Form 2, Form 3, Form 4)"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Stream (e.g., East, West, North, South)"
              value={formData.stream}
              onChange={(e) => setFormData({...formData, stream: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={formData.teacherId}
              onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Class Teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name} ({teacher.email})</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Capacity (e.g., 40)"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
                 Save Class
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {editingClass && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg mb-6 border border-yellow-300 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <span></span> Edit Class: {editingClass.name}
          </h3>
          <form onSubmit={handleUpdateClass} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              value={formData.stream}
              onChange={(e) => setFormData({...formData, stream: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={formData.teacherId}
              onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Class Teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
            </select>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
                 Update Class
              </button>
              <button type="button" onClick={cancelEdit} className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stream</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <div className="text-4xl mb-2"></div>
                    No classes found. Click "Add New Class" to create your first class.
                  </td>
                </tr>
              ) : (
                classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{cls.name}</td>
                    <td className="px-6 py-4 text-gray-600">{cls.stream || '-'}</td>
                    <td className="px-6 py-4">
                      {cls.teacherId ? (
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          <span></span> {getTeacherName(cls.teacherId)}
                        </span>
                      ) : (
                        <span className="text-orange-500 flex items-center gap-1">
                          <span></span> Not Assigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                        {cls.studentCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{cls.capacity || '-'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => startEdit(cls)}
                        className="text-blue-600 hover:text-blue-800 mr-3 transition-colors"
                        title="Edit Class"
                      >
                         Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id, `${cls.name} ${cls.stream || ''}`)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete Class"
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
      
      {teachers.length === 0 && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-800 flex items-center gap-2">
            <span></span> No teachers available. Please add teachers first in Teacher Management tab.
          </p>
        </div>
      )}
    </div>
  );
}

export default ClassManagement;