import React, { useState, useEffect } from 'react';
import { authAPI, subjectAPI } from '../../services/api';

function SubjectAssignment() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTeachers();
    loadSubjects();
    loadAssignments();
  }, []);

  const loadTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/admin/teachers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      } else {
        console.error('Failed to load teachers');
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const loadSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/TeacherSubjects/all-assignments', {
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

  const handleAssign = async () => {
    if (!selectedTeacher || !selectedSubject) {
      setMessage('⚠️ Please select both teacher and subject');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/TeacherSubjects/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teacherId: parseInt(selectedTeacher),
          subjectId: parseInt(selectedSubject)
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ ${data.message || 'Subject assigned successfully!'}`);
        setMessageType('success');
        loadAssignments();
        setSelectedTeacher('');
        setSelectedSubject('');
      } else {
        setMessage(`❌ ${data.message || 'Failed to assign subject'}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error assigning subject');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleRemoveAssignment = async (id, teacherName, subjectName) => {
    if (!confirm(`🗑️ Remove assignment: ${teacherName} → ${subjectName}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/TeacherSubjects/remove/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage(` Assignment removed successfully`);
        setMessageType('success');
        loadAssignments();
      } else {
        const data = await response.json();
        setMessage(`❌ ${data.message || 'Failed to remove assignment'}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error removing assignment');
      setMessageType('error');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600">
        <h2 className="text-2xl font-bold text-white"> Assign Subjects to Teachers</h2>
        <p className="text-purple-100 text-sm mt-1">Manage which subjects each teacher can teach</p>
      </div>
      
      <div className="p-6">
        {message && (
          <div className={`p-3 rounded-lg mb-4 ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Select Teacher</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.email})
                </option>
              ))}
            </select>
            {teachers.length === 0 && (
              <p className="text-xs text-yellow-600 mt-1"> No teachers available. Add teachers first.</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Select Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Select Subject --</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {subjects.length === 0 && (
              <p className="text-xs text-yellow-600 mt-1">No subjects available. Add subjects first.</p>
            )}
          </div>
        </div>
        
        <button
          onClick={handleAssign}
          disabled={loading || !selectedTeacher || !selectedSubject}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-200 shadow-md"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Assigning...
            </span>
          ) : (
            'Assign Subject to Teacher'
          )}
        </button>
        
        <h3 className="text-xl font-bold mt-8 mb-4 text-gray-800 flex items-center gap-2">
           Current Assignments
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">({assignments.length})</span>
        </h3>
        
        {assignments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-2"></div>
            <p className="text-gray-500">No assignments yet. Use the form above to assign subjects to teachers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <span className="flex items-center gap-1"> {assignment.teacherName}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1"> {assignment.subjectName}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(assignment.assignedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleRemoveAssignment(assignment.id, assignment.teacherName, assignment.subjectName)}
                        className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                      >
                        🗑️ Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubjectAssignment;