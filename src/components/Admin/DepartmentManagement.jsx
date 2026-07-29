import React, { useState, useEffect } from 'react';

function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAssignHODForm, setShowAssignHODForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      
      // Load departments
      const deptResponse = await fetch('https://school-yathu.onrender.com/api/Admin/departments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (deptResponse.ok) {
        const data = await deptResponse.json();
        setDepartments(data);
      }

      // Load teachers
      const teachersResponse = await fetch('https://school-yathu.onrender.com/api/Admin/teachers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (teachersResponse.ok) {
        const data = await teachersResponse.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Department name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/Admin/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess('Department created successfully!');
        setShowAddForm(false);
        setFormData({ name: '', description: '' });
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create department');
      }
    } catch (error) {
      console.error('Error creating department:', error);
      setError('Network error');
    }
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name || '',
      description: department.description || ''
    });
    setShowEditForm(true);
  };

  const handleUpdateDepartment = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Department name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/Admin/departments/${editingDepartment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess('Department updated successfully!');
        setShowEditForm(false);
        setEditingDepartment(null);
        setFormData({ name: '', description: '' });
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update department');
      }
    } catch (error) {
      console.error('Error updating department:', error);
      setError('Network error');
    }
  };

  const handleDeleteDepartment = async (id, name) => {
    if (!confirm(`Are you sure you want to delete the department "${name}"?\n\nThis will also remove all associated teachers and subjects.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/Admin/departments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess(`Department "${name}" deleted successfully!`);
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete department');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      setError('Network error');
    }
  };

  // NEW: Handle assigning Head of Department
  const handleAssignHOD = async () => {
    if (!selectedDepartmentId || !selectedTeacherId) {
      setError('Please select both a department and a teacher');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/Admin/assign-head-of-department', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          departmentId: parseInt(selectedDepartmentId),
          teacherId: parseInt(selectedTeacherId)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Head of Department assigned successfully!');
        setShowAssignHODForm(false);
        setSelectedDepartmentId('');
        setSelectedTeacherId('');
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to assign Head of Department');
      }
    } catch (error) {
      console.error('Error assigning HOD:', error);
      setError('Network error');
    }
  };

  // NEW: Handle removing Head of Department
  const handleRemoveHOD = async (departmentId, departmentName, headName) => {
    if (!confirm(`Are you sure you want to remove "${headName}" as Head of ${departmentName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/Admin/remove-head-of-department', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(departmentId)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Head of Department removed successfully!');
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to remove Head of Department');
      }
    } catch (error) {
      console.error('Error removing HOD:', error);
      setError('Network error');
    }
  };

  const closeEditForm = () => {
    setShowEditForm(false);
    setEditingDepartment(null);
    setFormData({ name: '', description: '' });
  };

  if (loading) {
    return <div className="text-center py-8">Loading data...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Department Management</h2>
          <p className="text-sm text-gray-500">Create, edit, and manage school departments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAssignHODForm(!showAssignHODForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Assign Head of Department
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Department
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-green-50 text-green-700 border border-green-200 mb-4">
          {success}
        </div>
      )}

      {/* Assign Head of Department Form */}
      {showAssignHODForm && (
        <div className="bg-gray-50 p-4 rounded-lg border mb-6">
          <h3 className="font-semibold mb-3">Assign Head of Department</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Department *</label>
              <select
                value={selectedDepartmentId}
                onChange={(e) => setSelectedDepartmentId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Department --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} {dept.headName !== 'Not Assigned' ? `(Current: ${dept.headName})` : '(No Head Assigned)'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Select Teacher *</label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Teacher --</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} - {teacher.departmentName || 'No Department'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAssignHOD}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Assign Head of Department
            </button>
            <button
              onClick={() => setShowAssignHODForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Department Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg border mb-6">
          <h3 className="font-semibold mb-3">Create New Department</h3>
          <form onSubmit={handleAddDepartment} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Department Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Science Department"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Department description..."
                rows="2"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Create Department
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Department Form */}
      {showEditForm && editingDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Department</h3>
              <button
                onClick={closeEditForm}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateDepartment} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Department Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Update Department
                </button>
                <button
                  type="button"
                  onClick={closeEditForm}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Departments List */}
      {departments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No departments created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{dept.name}</h3>
                  {dept.description && (
                    <p className="text-sm text-gray-500 mt-1">{dept.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditDepartment(dept)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Edit Department"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete Department"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${dept.headName !== 'Not Assigned' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  Head: {dept.headName || 'Not Assigned'}
                </span>
                {dept.headName !== 'Not Assigned' && (
                  <button
                    onClick={() => handleRemoveHOD(dept.id, dept.name, dept.headName)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove HOD
                  </button>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm text-gray-600">
                <span>Teachers: {dept.teacherCount}</span>
                <span>Subjects: {dept.subjectCount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DepartmentManagement;