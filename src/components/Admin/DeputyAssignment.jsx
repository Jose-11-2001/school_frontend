import React, { useState, useEffect } from 'react';

function DeputyAssignment() {
  const [deputies, setDeputies] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [formData, setFormData] = useState({
    deputyId: '',
    task: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    loadDeputies();
    loadAssignments();
  }, []);

  const loadDeputies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/Admin/deputies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDeputies(data);
      }
    } catch (error) {
      console.error('Error loading deputies:', error);
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

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!formData.deputyId || !formData.task) {
      setMessage('Please select a deputy and enter a task');
      setMessageType('error');
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
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage('Task assigned to deputy successfully!');
        setMessageType('success');
        setFormData({ deputyId: '', task: '', description: '' });
        loadAssignments();
      } else {
        const data = await response.json();
        setMessage(data.message || 'Failed to assign task');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      setMessage('Network error');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 5000);
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Deputy Head Teacher Tasks</h2>
          <p className="text-sm text-gray-500">Assign and manage tasks for deputy head teachers</p>
        </div>
        <button onClick={loadAssignments} className="text-blue-500 hover:text-blue-700">
          Refresh
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Assign Task Form */}
      <div className="bg-gray-50 p-4 rounded-lg border mb-6">
        <h3 className="font-semibold text-lg mb-3">Assign New Task</h3>
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Deputy Head Teacher</label>
            <select
              value={formData.deputyId}
              onChange={(e) => setFormData({...formData, deputyId: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">-- Select Deputy --</option>
              {deputies.map((deputy) => (
                <option key={deputy.id} value={deputy.id}>
                  {deputy.name} - {deputy.pendingTasks} pending tasks
                </option>
              ))}
            </select>
            {deputies.length === 0 && (
              <p className="text-xs text-yellow-600 mt-1">No deputy head teachers found. Please add a deputy head teacher first.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Task</label>
            <input
              type="text"
              value={formData.task}
              onChange={(e) => setFormData({...formData, task: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g., Review and approve exam results"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Additional details about the task..."
              rows="2"
            />
          </div>
          <button
            type="submit"
            disabled={loading || deputies.length === 0}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Assigning...' : 'Assign Task'}
          </button>
        </form>
      </div>

      {/* Assignment History */}
      <h3 className="font-semibold text-lg mb-3">All Assignments</h3>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deputy</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No assignments yet.
                </td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{assignment.deputyName}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium">{assignment.task}</div>
                    {assignment.description && (
                      <div className="text-xs text-gray-500 mt-1">{assignment.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(assignment.assignedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DeputyAssignment;