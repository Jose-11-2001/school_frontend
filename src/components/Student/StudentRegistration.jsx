import React, { useState, useEffect } from 'react';

function SubjectRegistration() {
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [registeredSubjects, setRegisteredSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/StudentSubject/available-subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAvailableSubjects(data.availableSubjects || []);
      setRegisteredSubjects(data.registeredSubjects || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
      setMessage('❌ Error loading subjects');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (subjectId, subjectName, teacherName, teacherId) => {
    if (!confirm(`Register for ${subjectName} taught by ${teacherName}?\n\nThe teacher will be notified of your registration.`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/StudentSubject/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subjectId })
      });
      
      const data = await response.json();
      if (response.ok) {
        setMessage(` ${data.message} Teacher has been notified.`);
        setMessageType('success');
        loadSubjects(); // Refresh list
      } else {
        setMessage(`❌ ${data.message}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('❌ Error registering for subject');
      setMessageType('error');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading available subjects...</p>
        </div>
      </div>
    );
  }
  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-3 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-50 text-blue-900 border border-blue-300' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}
      
      {/* Registered Subjects */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-blue-600">
          <h2 className="text-2xl font-bold text-white">My Registered Subjects</h2>
          <p className="text-blue-100 text-sm mt-1">Subjects you have successfully registered for</p>
        </div>
        <div className="p-6">
          {registeredSubjects.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2"></div>
              <p className="text-gray-500">You haven't registered for any subjects yet.</p>
              <p className="text-sm text-gray-400 mt-1">Browse available subjects below and register.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {registeredSubjects.map(sub => (
                <div key={sub.subjectId} className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-blue-800 text-lg">{sub.subjectName}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1"> Teacher: {sub.teacherName}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                         Registered: {new Date(sub.registeredAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-blue-500 text-xl">✓</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Available Subjects */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600">
          <h2 className="text-2xl font-bold text-white"> Available Subjects</h2>
          <p className="text-blue-100 text-sm mt-1">Subjects you can register for</p>
        </div>
        <div className="p-6">
          {availableSubjects.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2"></div>
              <p className="text-gray-500">No subjects available for registration.</p>
              <p className="text-sm text-gray-400 mt-1">You have registered for all available subjects.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableSubjects.map(sub => (
                <div key={sub.subjectId} className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow">
                  <div>
                    <div className="font-semibold text-blue-800 text-lg">{sub.subjectName}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1"> Taught by: {sub.teacherName}</span>
                    </div>
                    {sub.subjectCode && (
                      <div className="text-xs text-gray-400 mt-1">Code: {sub.subjectCode}</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleRegister(sub.subjectId, sub.subjectName, sub.teacherName, sub.teacherId)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200 hover:shadow-md font-medium flex items-center gap-1"
                  >
                    Register →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Registration Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl"></span>
        </div>
      </div>
    </div>
  );
}

export default SubjectRegistration;