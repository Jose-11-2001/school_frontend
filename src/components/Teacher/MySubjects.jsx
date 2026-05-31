import React, { useState, useEffect } from 'react';

function MySubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMySubjects();
  }, []);

  const loadMySubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/TeacherSubjects/my-subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load subjects');
      }
      
      const data = await response.json();
      console.log('Subjects loaded:', data);
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
      setError('Failed to load subjects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading your subjects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">{error}</p>
          <button 
            onClick={loadMySubjects}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📚 Subjects I Teach</h2>
          <p className="text-gray-600 mt-1">Total Subjects: {subjects.length}</p>
        </div>
        <button
          onClick={loadMySubjects}
          className="text-blue-500 hover:text-blue-700 text-sm"
          title="Refresh"
        >
          🔄 Refresh
        </button>
      </div>
      
      {subjects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">📖</div>
          <p className="text-gray-500 text-lg">No subjects assigned yet.</p>
          <p className="text-sm text-gray-400 mt-2">Please contact the administrator to assign subjects to you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {subjects.map((subject) => (
            <div 
              key={subject.id} 
              className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:scale-105"
            >
              <div className="text-lg font-semibold text-blue-800">{subject.name}</div>
              {subject.code && (
                <div className="text-sm text-blue-600 mt-1">Code: {subject.code}</div>
              )}
              {subject.className && (
                <div className="text-xs text-gray-500 mt-2">
                  Class: {subject.className} {subject.stream}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MySubjects;