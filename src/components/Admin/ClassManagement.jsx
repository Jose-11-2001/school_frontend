import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    stream: '',
    capacity: ''
  });

  useEffect(() => {
    loadClasses();
    loadStudents();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await adminAPI.getClasses();
      setClasses(response.data);
    } catch (error) {
      console.error('Error loading classes:', error);
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

  const getStudentCountByClass = (className, stream) => {
    return students.filter(s => s.class === className && s.stream === stream).length;
  };

  const getCapacityStatus = (studentCount, capacity) => {
    if (!capacity) return { status: 'info', message: 'No capacity set', color: 'gray' };
    const percentage = (studentCount / capacity) * 100;
    if (percentage >= 100) return { status: 'danger', message: 'Full', color: 'red' };
    if (percentage >= 85) return { status: 'warning', message: 'Almost Full', color: 'orange' };
    if (percentage >= 70) return { status: 'info', message: 'Good', color: 'blue' };
    return { status: 'success', message: 'Available', color: 'green' };
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setMessage('Class name is required');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      await adminAPI.addClass({
        name: formData.name,
        stream: formData.stream,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      });
      
      setMessage('Class added successfully!');
      setShowAddForm(false);
      setFormData({ name: '', stream: '', capacity: '' });
      loadClasses();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add class';
      setMessage(`Error: ${errorMessage}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    
    try {
      await adminAPI.updateClass(editingClass.id, {
        name: formData.name,
        stream: formData.stream,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      });
      
      setMessage('Class updated successfully!');
      setEditingClass(null);
      setFormData({ name: '', stream: '', capacity: '' });
      loadClasses();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update class';
      setMessage(`Error: ${errorMessage}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteClass = async (id, name) => {
    if (confirm(`Are you sure you want to delete class "${name}"?\n\nThis action cannot be undone.`)) {
      try {
        await adminAPI.deleteClass(id);
        setMessage(`Class "${name}" deleted successfully!`);
        loadClasses();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Error:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete class';
        setMessage(`Error: ${errorMessage}`);
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const startEdit = (cls) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      stream: cls.stream || '',
      capacity: cls.capacity || ''
    });
  };

  const cancelEdit = () => {
    setEditingClass(null);
    setFormData({ name: '', stream: '', capacity: '' });
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
          <h2 className="text-2xl font-bold text-gray-800">Class Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all classes, streams, and capacity</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md flex items-center gap-2"
        >
          <span className="text-lg">+</span> Add New Class
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg mb-4 ${
          message.includes('successfully') || message.includes('added') || message.includes('updated')
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Add Class Form */}
      {showAddForm && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 border border-blue-200 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Add New Class</h3>
          <form onSubmit={handleAddClass} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">Class Name *</label>
              <input
                type="text"
                placeholder="e.g., Form 1, Form 2, Form 3, Form 4"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">Stream</label>
              <input
                type="text"
                placeholder="e.g., East, West, North, South"
                value={formData.stream}
                onChange={(e) => setFormData({...formData, stream: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">Capacity</label>
              <input
                type="number"
                placeholder="e.g., 40"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-3 flex gap-3">
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

      {/* Edit Class Form */}
      {editingClass && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg mb-6 border border-yellow-300 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Edit Class: {editingClass.name}</h3>
          <form onSubmit={handleUpdateClass} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">Class Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">Stream</label>
              <input
                type="text"
                value={formData.stream}
                onChange={(e) => setFormData({...formData, stream: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-3 flex gap-3">
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

      {/* Classes Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stream</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No classes found. Click "Add New Class" to create your first class.
                  </td>
                </tr>
              ) : (
                classes.map((cls) => {
                  const studentCount = getStudentCountByClass(cls.name, cls.stream);
                  const capacityStatus = getCapacityStatus(studentCount, cls.capacity);
                  const isOverCapacity = cls.capacity && studentCount > cls.capacity;
                  
                  return (
                    <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{cls.name}</td>
                      <td className="px-6 py-4 text-gray-600">{cls.stream || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isOverCapacity ? 'text-red-600' : 'text-gray-900'}`}>
                            {studentCount}
                          </span>
                          {cls.capacity && (
                            <span className="text-sm text-gray-500">/ {cls.capacity}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{cls.capacity || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          capacityStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                          capacityStatus.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                          capacityStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                          capacityStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {capacityStatus.message}
                        </span>
                      </td>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Info note about form teacher assignment */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-700 text-sm">
          <span className="font-semibold">Note:</span> Class teachers (Form Teachers) can be assigned in the 
          <span className="font-semibold"> "Form Teacher Assignment"</span> tab. 
          This page only manages class creation, streams, and capacity.
        </p>
      </div>
    </div>
  );
}

export default ClassManagement;