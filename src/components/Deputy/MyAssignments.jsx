import React, { useState, useEffect } from 'react';

function MyAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const url = filter 
        ? `https://school-yathu.onrender.com/api/Deputy/my-assignments?status=${filter}`
        : 'https://school-yathu.onrender.com/api/Deputy/my-assignments';
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      } else {
        setError('Failed to load assignments');
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (assignmentId, status) => {
    if (!confirm(`Mark this task as ${status}?`)) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/Deputy/update-status/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setSuccess(`Task status updated to ${status}`);
        loadAssignments();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Network error');
    } finally {
      setUpdating(false);
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

  if (loading) {
    return <div className="text-center py-8">Loading assignments...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">My Assignments</h2>
          <p className="text-sm text-gray-500">Tasks assigned by the Headteacher</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              loadAssignments();
            }}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <button onClick={loadAssignments} className="text-blue-500 hover:text-blue-700">
            Refresh
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

      {assignments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No assignments found.</p>
          <p className="text-sm text-gray-400 mt-1">You will see tasks assigned by the Headteacher here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{assignment.task}</h3>
                  {assignment.description && (
                    <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}</span>
                    {assignment.completedAt && (
                      <span>Completed: {new Date(assignment.completedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                    {assignment.status}
                  </span>
                </div>
              </div>
              {assignment.status !== 'Completed' && (
                <div className="mt-3 pt-3 border-t flex gap-2">
                  {assignment.status === 'Pending' && (
                    <button
                      onClick={() => updateStatus(assignment.id, 'InProgress')}
                      disabled={updating}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm disabled:bg-gray-400"
                    >
                      Start Task
                    </button>
                  )}
                  {(assignment.status === 'Pending' || assignment.status === 'InProgress') && (
                    <button
                      onClick={() => updateStatus(assignment.id, 'Completed')}
                      disabled={updating}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm disabled:bg-gray-400"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAssignments;