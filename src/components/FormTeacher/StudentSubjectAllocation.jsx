import React, { useState, useEffect } from 'react';

function StudentSubjectAllocation() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [classFilter, setClassFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Load students from FormTeacher
      const studentsRes = await fetch('https://school-yathu.onrender.com/api/FormTeacher/my-students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(data);
      }

      // Load subjects
      const subjectsRes = await fetch('https://school-yathu.onrender.com/api/Admin/subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (subjectsRes.ok) {
        const data = await subjectsRes.json();
        setSubjects(data);
      }

      // Load existing allocations
      const allocRes = await fetch('https://school-yathu.onrender.com/api/StudentSubject/my-subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (allocRes.ok) {
        const data = await allocRes.json();
        setAllocations(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Failed to load data');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async () => {
    if (!selectedStudent || !selectedSubject) {
      setMessage('Please select both student and subject');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/StudentSubject/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: parseInt(selectedStudent),
          subjectId: parseInt(selectedSubject)
        })
      });

      if (response.ok) {
        setMessage('✅ Subject allocated to student successfully!');
        setMessageType('success');
        loadData();
        setSelectedStudent('');
        setSelectedSubject('');
      } else {
        const data = await response.json();
        setMessage(`❌ ${data.message || 'Failed to allocate subject'}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error allocating subject. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleRemoveAllocation = async (id, subjectName, studentName) => {
    if (!confirm(`Remove ${subjectName} from ${studentName}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/StudentSubject/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage('✅ Subject removed from student successfully!');
        setMessageType('success');
        loadData();
      } else {
        const data = await response.json();
        setMessage(`❌ ${data.message || 'Failed to remove subject'}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error removing subject');
      setMessageType('error');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  // Get unique classes for filter
  const uniqueClasses = [...new Set(students.map(s => s.class))].filter(Boolean);

  const filteredStudents = classFilter 
    ? students.filter(s => s.class === classFilter)
    : students;

  const filteredAllocations = allocations.filter(a => {
    if (classFilter) {
      const student = students.find(s => s.id === a.studentId);
      return student?.class === classFilter;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-teal-600">
        <h2 className="text-2xl font-bold text-white">📚 Allocate Subjects to Students</h2>
        <p className="text-green-100 text-sm mt-1">Form Teacher - Manage subject allocations for students</p>
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
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">Filter by Class</label>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Classes</option>
            {uniqueClasses.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">-- Select Student --</option>
              {filteredStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName} ({student.admissionNumber}) - {student.class} {student.stream || ''}
                </option>
              ))}
            </select>
            {filteredStudents.length === 0 && (
              <p className="text-xs text-yellow-600 mt-1">No students found in your class.</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Select Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">-- Select Subject --</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} {subject.code && `(${subject.code})`}
                </option>
              ))}
            </select>
            {subjects.length === 0 && (
              <p className="text-xs text-yellow-600 mt-1">No subjects available.</p>
            )}
          </div>
        </div>
        
        <button
          onClick={handleAllocate}
          disabled={loading || !selectedStudent || !selectedSubject}
          className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-200 shadow-md"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Allocating...
            </span>
          ) : (
            '📌 Allocate Subject to Student'
          )}
        </button>
        
        <h3 className="text-xl font-bold mt-8 mb-4 text-gray-800 flex items-center gap-2">
          📋 Current Allocations
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">({filteredAllocations.length})</span>
        </h3>
        
        {filteredAllocations.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No allocations yet. Use the form above to allocate subjects to students.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAllocations.map((alloc) => {
                  const student = students.find(s => s.id === alloc.studentId);
                  return (
                    <tr key={alloc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{student?.fullName || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student?.admissionNumber || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{alloc.subjectName}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alloc.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {alloc.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleRemoveAllocation(alloc.id, alloc.subjectName, student?.fullName || '')}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          🗑️ Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentSubjectAllocation;