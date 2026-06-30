import React, { useState, useEffect } from 'react';

function SubjectSelection({ studentData }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (studentData) {
      loadSubjects();
    }
  }, [studentData]);

  const loadSubjects = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/Student/available-subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSubjects(data.availableSubjects || []);
        setSelectedSubjects(data.selectedSubjects || []);
      } else {
        setError('Failed to load subjects');
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubject = (subjectId) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const handleSubmitSelection = async () => {
    if (selectedSubjects.length === 0) {
      setError('Please select at least one subject');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/Student/select-subject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subjectId: selectedSubjects[0] // Send first subject
        })
      });

      if (response.ok) {
        setSuccess('✅ Subject selection submitted successfully! Waiting for form teacher approval.');
        setTimeout(() => setSuccess(''), 5000);
        loadSubjects();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to submit selection');
      }
    } catch (error) {
      console.error('Error submitting selection:', error);
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading available subjects...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">📝 Subject Selection</h2>
          <p className="text-sm text-gray-500">Select your subjects for the current academic year</p>
        </div>
        <button onClick={loadSubjects} className="text-blue-500 hover:text-blue-700">
          🔄 Refresh
        </button>
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

      {subjects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No subjects available for selection.</p>
          <p className="text-sm text-gray-400 mt-1">Please contact your form teacher for assistance.</p>
        </div>
      ) : (
        <div>
          <div className="bg-gray-50 p-4 rounded-lg border mb-4">
            <p className="text-sm text-gray-600">
              Select your subjects from the list below. Selected subjects will be sent to your form teacher for approval.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                onClick={() => handleSelectSubject(subject.id)}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  selectedSubjects.includes(subject.id)
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{subject.name}</h3>
                    {subject.code && (
                      <p className="text-sm text-gray-500">Code: {subject.code}</p>
                    )}
                    {subject.type && (
                      <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {subject.type}
                      </span>
                    )}
                  </div>
                  {selectedSubjects.includes(subject.id) && (
                    <span className="text-blue-500 text-xl">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  Selected: <span className="font-semibold">{selectedSubjects.length}</span> subjects
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Click on a subject to select or deselect it
                </p>
              </div>
              <button
                onClick={handleSubmitSelection}
                disabled={submitting || selectedSubjects.length === 0}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Selection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubjectSelection;