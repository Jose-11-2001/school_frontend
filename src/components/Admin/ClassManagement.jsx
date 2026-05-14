
import React, { useState, useEffect } from 'react';

function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
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
      const response = await fetch('http://localhost:5123/api/admin/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
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
      const response = await fetch('http://localhost:5123/api/admin/teachers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTeachers(data.filter(t => t.isActive !== false));
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5123/api/admin/classes', {
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
        alert('Class added successfully!');
        setShowAddForm(false);
        setFormData({ name: '', stream: '', teacherId: '', capacity: '' });
        loadClasses();
      } else {
        const error = await response.json();
        alert('Error: ' + (error.message || 'Failed to add class'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding class');
    }
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5123/api/admin/classes/${editingClass.id}`, {
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
      
      if (response.ok) {
        alert('Class updated successfully!');
        setEditingClass(null);
        setFormData({ name: '', stream: '', teacherId: '', capacity: '' });
        loadClasses();
      } else {
        const error = await response.json();
        alert('Error: ' + (error.message || 'Failed to update class'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating class');
    }
  };

  const handleDeleteClass = async (id, name) => {
    if (confirm(`Are you sure you want to delete class "${name}"?`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5123/api/admin/classes/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          alert('Class deleted successfully!');
          loadClasses();
        } else {
          const error = await response.json();
          alert('Error: ' + (error.message || 'Failed to delete class'));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting class');
      }
    }
  };

  const startEdit = (cls) => {
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

  if (loading) return <div className="text-center py-8">Loading classes...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Class Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          + Add New Class
        </button>
      </div>

      {/* Add Class Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Add New Class</h3>
          <form onSubmit={handleAddClass} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Class Name * (e.g., Form 1)"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Stream (e.g., East)"
              value={formData.stream}
              onChange={(e) => setFormData({...formData, stream: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <select
              value={formData.teacherId}
              onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
              className="px-3 py-2 border rounded"
            >
              <option value="">Select Class Teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name} ({teacher.email})</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Capacity"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Save</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Class Form */}
      {editingClass && (
        <div className="bg-yellow-50 p-6 rounded-lg mb-6 border border-yellow-300">
          <h3 className="text-xl font-semibold mb-4">Edit Class: {editingClass.name}</h3>
          <form onSubmit={handleUpdateClass} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Class Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Stream"
              value={formData.stream}
              onChange={(e) => setFormData({...formData, stream: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <select
              value={formData.teacherId}
              onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
              className="px-3 py-2 border rounded"
            >
              <option value="">Select Class Teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name} ({teacher.email})</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Capacity"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Update</button>
              <button type="button" onClick={cancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Classes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stream</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classes.map((cls) => (
              <tr key={cls.id}>
                <td className="px-6 py-4 font-medium">{cls.name}</td>
                <td className="px-6 py-4">{cls.stream || '-'}</td>
                <td className="px-6 py-4">
                  {cls.teacherName ? (
                    <span className="text-green-600 font-medium">{cls.teacherName}</span>
                  ) : (
                    <span className="text-red-500">Not Assigned</span>
                  )}
                </td>
                <td className="px-6 py-4">{cls.studentCount || 0}</td>
                <td className="px-6 py-4">{cls.capacity || '-'}</td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    onClick={() => startEdit(cls)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClass(cls.id, `${cls.name} ${cls.stream}`)}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {teachers.length === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">⚠️ No teachers available. Please add teachers first in Teacher Management tab.</p>
        </div>
      )}
    </div>
  );
}

export default ClassManagement;