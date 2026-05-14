import React, { useState, useEffect } from 'react';

function MySubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMySubjects();
  }, []);

  const loadMySubjects = async () => {
    try {
      const response = await fetch('http://localhost:5123/api/teachersubjects/my-subjects', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="bg-white rounded-lg shadow p-8 text-center">Loading your subjects...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Subjects I Teach</h2>
      
      {subjects.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No subjects assigned yet. Please contact the administrator.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {subjects.map((subject) => (
            <div key={subject.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-lg font-semibold text-blue-800">{subject.name}</div>
              <div className="text-sm text-blue-600">{subject.code}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MySubjects;
