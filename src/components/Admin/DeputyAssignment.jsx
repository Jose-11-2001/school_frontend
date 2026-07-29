import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

function DeputyAssignment() {
  const [teachers, setTeachers] = useState([]);
  const [deputy, setDeputy] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    task: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
    loadAssignments();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all teachers
      const teachersRes = await adminAPI.getTeachers();
      setTeachers(teachersRes.data);
      
      // Fetch current deputy status
      const deputyRes = await adminAPI.get('/Admin/deputy-status');
      setDeputy(deputyRes.data.deputy);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/Deputy/assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const handleAssignDeputy = async () => {
    if (!selectedTeacherId) {
      setError('Please select a teacher');
      return;
    }

    try {
      setLoading(true);
      const response = await adminAPI.post('/Admin/assign-deputy', {
        teacherId: parseInt(selectedTeacherId),
        replaceExisting: !!deputy
      });
      
      setMessage(response.data.message);
      setError('');
      fetchData(); // Refresh data
      setSelectedTeacherId('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to assign deputy');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDeputy = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.post('/Admin/remove-deputy');
      setMessage(response.data.message);
      setError('');
      fetchData(); // Refresh data
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to remove deputy');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!deputy) {
      setError('No deputy head teacher assigned');
      return;
    }
    if (!formData.task) {
      setError('Please enter a task');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/Deputy/assign-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deputyId: deputy.id,
          task: formData.task,
          description: formData.description
        })
      });

      if (response.ok) {
        setMessage('Task assigned to deputy successfully!');
        setError('');
        setFormData({ task: '', description: '' });
        loadAssignments();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to assign task');
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      setError('Network error');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setMessage('');
        setError('');
      }, 5000);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'InProgress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !deputy) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Deputy Head Teacher Management</h2>
        <p className="text-sm text-gray-500">Assign deputy head teacher and manage tasks</p>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-3 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      {/* Current Deputy */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">Current Deputy Head Teacher</h3>
        {deputy ? (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <p className="text-sm">
                <span className="font-medium">{deputy.name}</span>
                <span className="text-gray-500 ml-2">({deputy.email})</span>
              </p>
            </div>
            <button
              onClick={handleRemoveDeputy}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm transition-colors"
            >
              Remove Deputy
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No Deputy Head Teacher assigned</p>
        )}
      </div>

      {/* Assign New Deputy */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Assign New Deputy Head Teacher</h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Select a teacher...</option>
            {teachers
              .filter(t => t.id !== deputy?.id)
              .map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} - {teacher.email}
                </option>
              ))}
          </select>
          
          <button
            onClick={handleAssignDeputy}
            disabled={!selectedTeacherId || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Assign as Deputy
          </button>
        </div>
        
        {deputy && (
          <p className="text-xs text-yellow-600 mt-2">
            Note: Assigning a new deputy will replace the current deputy
          </p>
        )}
      </div>

      {/* Assign Task Form */}
      {deputy && (
        <div className="bg-gray-50 p-4 rounded-lg border mb-6">
          <h3 className="font-semibold text-lg mb-3">Assign Task to {deputy.name}</h3>
          <form onSubmit={handleAssignTask} className="space-y-3">
            <div>
              <input
                type="text"
                value={formData.task}
                onChange={(e) => setFormData({...formData, task: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Task title"
                required
              />
            </div>
            <div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Task description (optional)"
                rows="2"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
            >
              {loading ? 'Assigning...' : 'Assign Task'}
            </button>
          </form>
        </div>
      )}

      {/* Assignment History */}
      <h3 className="font-semibold text-lg mb-3">Task History</h3>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Assigned At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-4 text-center text-gray-500 text-sm">
                    No assignments yet.
                  </td>
                </tr>
              ) : (
                assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{assignment.task}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                      {assignment.description || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                      {new Date(assignment.assignedAt).toLocaleDateString()}
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

export default DeputyAssignment;