import React, { useState, useEffect } from 'react';

function StudentSubjectAllocation() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [term, setTerm] = useState('Term 1');
  const [classes, setClasses] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Load form teacher's classes
      const classesRes = await fetch('https://school-yathu.onrender.com/api/FormTeacher/my-classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (classesRes.ok) {
        const data = await classesRes.json();
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass(data[0].id.toString());
        }
      }

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
      await loadAllocations();

    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Failed to load data');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const loadAllocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const allocRes = await fetch('https://school-yathu.onrender.com/api/StudentSubject/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (allocRes.ok) {
        const data = await allocRes.json();
        setAllocations(data);
      }
    } catch (error) {
      console.error('Error loading allocations:', error);
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
          subjectId: parseInt(selectedSubject),
          academicYear: academicYear,
          term: term
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('✅ Subject allocated to student successfully!');
        setMessageType('success');
        await loadAllocations();
        setSelectedStudent('');
        setSelectedSubject('');
      } else {
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

  const handleBulkAllocate = async () => {
    if (selectedStudents.length === 0 || !selectedSubject) {
      setMessage('Please select students and a subject');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/StudentSubject/bulk-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentIds: selectedStudents.map(id => parseInt(id)),
          subjectId: parseInt(selectedSubject),
          academicYear: academicYear,
          term: term
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ ${data.message || 'Subjects allocated to students successfully!'}`);
        setMessageType('success');
        await loadAllocations();
        setSelectedStudents([]);
        setSelectedSubject('');
      } else {
        setMessage(`❌ ${data.message || 'Failed to allocate subjects'}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error allocating subjects. Please try again.');
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
        await loadAllocations();
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

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleAllStudents = () => {
    const filteredStudents = getFilteredStudents();
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const getFilteredStudents = () => {
    if (!selectedClass) return students;
    return students.filter(s => s.classId && s.classId.toString() === selectedClass);
  };

  const getStudentAllocations = (studentId) => {
    return allocations.filter(a => a.studentId === studentId && a.isActive);
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown';
  };

  const filteredStudents = getFilteredStudents();
  const filteredAllocations = allocations.filter(a => {
    if (selectedClass) {
      const student = students.find(s => s.id === a.studentId);
      return student?.classId && student.classId.toString() === selectedClass;
    }
    return true;
  });

  const terms = ['Term 1', 'Term 2', 'Term 3'];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-teal-600">
        <h2 className="text-2xl font-bold text-white">📚 Student Subject Allocation</h2>
        <p className="text-green-100 text-sm mt-1">Form Teacher - Manage subject allocations for your students</p>
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

        {/* Academic Year and Term Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Academic Year</label>
            <input
              type="number"
              value={academicYear}
              onChange={(e) => setAcademicYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Term</label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {terms.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Class Filter */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} {cls.stream || ''} ({cls.studentCount || 0} students)
              </option>
            ))}
          </select>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setIsBulkMode(false)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !isBulkMode 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Single Allocation
          </button>
          <button
            onClick={() => setIsBulkMode(true)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isBulkMode 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bulk Allocation
          </button>
        </div>
        
        {/* Allocation Form */}
        {!isBulkMode ? (
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
                <p className="text-xs text-yellow-600 mt-1">No students found in this class.</p>
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
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Select Students</label>
                <p className="text-sm text-gray-500">
                  {selectedStudents.length} student(s) selected
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleAllStudents}
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                >
                  {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              {filteredStudents.map((student) => (
                <label key={student.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => toggleStudentSelection(student.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm truncate">
                    {student.fullName}
                  </span>
                </label>
              ))}
              {filteredStudents.length === 0 && (
                <p className="text-gray-500 col-span-full text-center py-4">
                  No students available in this class.
                </p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Select Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Select Subject --</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code && `(${subject.code})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        <button
          onClick={isBulkMode ? handleBulkAllocate : handleAllocate}
          disabled={loading || (!isBulkMode && (!selectedStudent || !selectedSubject)) || (isBulkMode && (selectedStudents.length === 0 || !selectedSubject))}
          className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-200 shadow-md"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isBulkMode ? 'Allocating...' : 'Allocating...'}
            </span>
          ) : (
            isBulkMode 
              ? `Allocate Subject to ${selectedStudents.length} Student(s)` 
              : 'Allocate Subject to Student'
          )}
        </button>
        
        {/* Allocations List */}
        <h3 className="text-xl font-bold mt-8 mb-4 text-gray-800 flex items-center gap-2">
          Current Allocations
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year/Term</th>
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
                      <td className="px-6 py-4 text-sm text-gray-600">{alloc.subjectName || getSubjectName(alloc.subjectId)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {alloc.academicYear || academicYear} - {alloc.term || term}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alloc.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {alloc.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleRemoveAllocation(alloc.id, alloc.subjectName || getSubjectName(alloc.subjectId), student?.fullName || '')}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          Remove
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