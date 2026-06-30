import React, { useState, useEffect } from 'react';

function FormTeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/FormTeacher/my-classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      } else {
        setError('Failed to load classes');
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading your classes...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">📚 My Classes</h2>
          <p className="text-sm text-gray-500">Classes assigned to you as Form Teacher</p>
        </div>
        <button onClick={loadClasses} className="text-blue-500 hover:text-blue-700">
          🔄 Refresh
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No classes assigned to you yet.</p>
          <p className="text-sm text-gray-400 mt-1">Contact the Headteacher for assignment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{cls.name}</h3>
                  {cls.stream && (
                    <p className="text-sm text-gray-500">Stream: {cls.stream}</p>
                  )}
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {cls.studentCount || 0} Students
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Capacity: {cls.capacity || 'Not set'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Assigned: {new Date(cls.assignedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FormTeacherClasses;