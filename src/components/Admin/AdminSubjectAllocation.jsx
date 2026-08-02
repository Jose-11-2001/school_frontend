import React, { useState, useEffect } from 'react';

function AdminSubjectAllocation() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [term, setTerm] = useState('Term 1');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [allocations, setAllocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadClasses();
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
      loadAllocations();
    }
  }, [selectedClass, academicYear, term]);

  const loadClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/Admin/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass(data[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/Admin/subjects', {
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

  const loadStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/Admin/all-students?classId=${selectedClass}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://school-yathu.onrender.com/api/AdminSubjectAllocation/student-allocations?classId=${selectedClass}&year=${academicYear}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setAllocations(data);
      }
    } catch (error) {
      console.error('Error loading allocations:', error);
    }
  };

  const handleAllocateSubjects = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent || selectedSubjects.length === 0) {
      setMessage('Please select a student and at least one subject');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/AdminSubjectAllocation/allocate-subjects-to-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: parseInt(selectedStudent),
          subjectIds: selectedSubjects.map(id => parseInt(id)),
          academicYear: academicYear,
          term: term
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ Subjects allocated to student successfully!`);
        setMessageType('success');
        setSelectedSubjects([]);
        setSelectedStudent('');
        loadAllocations();
      } else {
        setMessage(`❌ ${data.message || 'Allocation failed'}`);
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

  const handleRemoveAllocation = async (id) => {
    if (!confirm('Remove this subject allocation?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/AdminSubjectAllocation/remove-allocation/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage('✅ Allocation removed successfully!');
        setMessageType('success');
        loadAllocations();
      } else {
        const data = await response.json();
        setMessage(`❌ ${data.message || 'Failed to remove'}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error removing allocation');
      setMessageType('error');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const toggleSubject = (subjectId) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === parseInt(studentId));
    return student ? student.fullName : 'Unknown';
  };

  const getStudentClass = (studentId) => {
    const student = students.find(s => s.id === parseInt(studentId));
    return student ? `${student.class} ${student.stream || ''}` : '';
  };

  const filteredStudents = students.filter(student =>
    student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📚 Student Subject Allocation</h2>
          <p className="text-sm text-gray-500 mt-1">Assign subjects to students for the academic year</p>
        </div>
        <button
          onClick={() => { loadClasses(); loadSubjects(); }}
          className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
        >
          🔄 Refresh
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Allocation Form */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
          <h3 className="text-lg font-semibold text-gray-800">📌 Allocate Subjects to Student</h3>
          <p className="text-sm text-gray-500">Select a student and assign subjects</p>
        </div>
        <div className="p-6">
          <form onSubmit={handleAllocateSubjects}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Select Class</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">-- Select Class --</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} {cls.stream || ''} ({cls.studentCount || 0} students)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Academic Year</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(parseInt(e.target.value))}
                >
                  {[2024, 2025, 2026, 2027, 2028].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Term</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Search Student</label>
              <input
                type="text"
                placeholder="Search by name or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Select Student</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                disabled={!selectedClass || students.length === 0}
              >
                <option value="">-- Select Student --</option>
                {filteredStudents.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.admissionNumber} - {student.fullName} ({student.class} {student.stream || ''})
                  </option>
                ))}
              </select>
              {students.length === 0 && selectedClass && (
                <p className="text-xs text-yellow-600 mt-1">No students in this class</p>
              )}
              {filteredStudents.length === 0 && searchTerm && (
                <p className="text-xs text-yellow-600 mt-1">No students match your search</p>
              )}
            </div>

            {/* Subject Selection */}
            {selectedStudent && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Select Subjects for <span className="text-blue-600">{getStudentName(selectedStudent)}</span>
                  <span className="text-sm text-gray-500 ml-2">({getStudentClass(selectedStudent)})</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg border max-h-60 overflow-y-auto">
                  {subjects.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-4">
                      No subjects available. Please add subjects first.
                    </p>
                  ) : (
                    subjects.map(subject => (
                      <label key={subject.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(subject.id)}
                          onChange={() => toggleSubject(subject.id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm">{subject.name}</span>
                        {subject.code && (
                          <span className="text-xs text-gray-400">({subject.code})</span>
                        )}
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selected: <span className="font-semibold text-blue-600">{selectedSubjects.length}</span> subject(s)
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !selectedStudent || selectedSubjects.length === 0}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-200 shadow-md"
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
                `Allocate ${selectedSubjects.length} Subject(s) to Student`
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Current Allocations */}
      {selectedClass && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Current Subject Allocations</h3>
                <p className="text-sm text-gray-600">
                  {classes.find(c => c.id == selectedClass)?.name} {classes.find(c => c.id == selectedClass)?.stream || ''} - {academicYear} {term}
                </p>
              </div>
              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {allocations.length} allocations
              </span>
            </div>
          </div>

          {allocations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <p>No subject allocations yet for this class.</p>
              <p className="text-sm text-gray-400 mt-1">Use the form above to allocate subjects to students.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allocations.map((alloc, index) => (
                    <tr key={alloc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{alloc.studentName}</td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">{alloc.admissionNumber}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {alloc.subjectName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{alloc.teacherName || 'Not assigned'}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleRemoveAllocation(alloc.id)}
                          className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">ℹ️ How Student Subject Allocation Works</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Select a class to see its students</li>
          <li>• Select a student and choose their subjects</li>
          <li>• Students will see their allocated subjects on their dashboard</li>
          <li>• Teachers will see students allocated to their subjects</li>
          <li>• Allocations are term-based</li>
        </ul>
      </div>
    </div>
  );
}

export default AdminSubjectAllocation;