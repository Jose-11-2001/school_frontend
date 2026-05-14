import React, { useState, useEffect } from 'react';

function SubjectRegistration() {
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [registeredSubjects, setRegisteredSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5123/api/StudentSubject/available-subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAvailableSubjects(data.availableSubjects || []);
      setRegisteredSubjects(data.registeredSubjects || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (subjectId, subjectName, teacherName) => {
    if (!confirm(`Register for ${subjectName} taught by ${teacherName}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5123/api/StudentSubject/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subjectId })
      });
      
      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        loadSubjects(); // Refresh list
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error registering for subject');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return <div className="text-center py-8">Loading available subjects...</div>;

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-3 rounded ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      
      {/* Registered Subjects */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-green-600">📚 My Registered Subjects</h2>
        {registeredSubjects.length === 0 ? (
          <p className="text-gray-500">You haven't registered for any subjects yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registeredSubjects.map(sub => (
              <div key={sub.subjectId} className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="font-semibold text-green-800">{sub.subjectName}</div>
                <div className="text-sm text-gray-600">Teacher: {sub.teacherName}</div>
                <div className="text-xs text-gray-400">Registered: {new Date(sub.registeredAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Available Subjects */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">📖 Available Subjects</h2>
        {availableSubjects.length === 0 ? (
          <p className="text-gray-500">No subjects available for registration.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableSubjects.map(sub => (
              <div key={sub.subjectId} className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-blue-800">{sub.subjectName}</div>
                  <div className="text-sm text-gray-600">Taught by: {sub.teacherName}</div>
                </div>
                <button
                  onClick={() => handleRegister(sub.subjectId, sub.subjectName, sub.teacherName)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Register
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SubjectRegistration;