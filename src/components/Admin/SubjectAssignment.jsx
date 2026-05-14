import React, { useState, useEffect } from 'react';
import { authAPI, subjectAPI } from '../../services/api';

function SubjectAssignment() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTeachers();
    loadSubjects();
    loadAssignments();
  }, []);

  const loadTeachers = async () => {
    try {
      // You'll need to add an endpoint to get all teachers
      const response = await fetch('http://localhost:5123/api/users/teachers', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await subjectAPI.getAll();
      setSubjects(response.data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadAssignments = async () => {
    try {
      const response = await fetch('http://localhost:5123/api/teachersubjects/all-assignments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
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
      setMessage('Please select both teacher and subject');
      return;
    }

    try {
      const response = await fetch('http://localhost:5123/api/teachersubjects/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          teacherId: parseInt(selectedTeacher),
          subjectId: parseInt(selectedSubject)
        })
      });

      if (response.ok) {
        setMessage('Subject assigned successfully!');
        loadAssignments();
        setSelectedTeacher('');
        setSelectedSubject('');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to assign subject');
      }
    } catch (error) {
      setMessage('Error assigning subject');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Assign Subjects to Teachers</h2>
      
      {message && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {message}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 mb-2">Select Teacher</label>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">-- Select Teacher --</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} ({teacher.email})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Select Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">-- Select Subject --</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <button
        onClick={handleAssign}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
      >
        Assign Subject
      </button>
      
      <h3 className="text-xl font-bold mt-8 mb-4">Current Assignments</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <tr key={assignment.id}>
                <td className="px-6 py-4">{assignment.teacherName}</td>
                <td className="px-6 py-4">{assignment.subjectName}</td>
                <td className="px-6 py-4">{new Date(assignment.assignedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SubjectAssignment;
