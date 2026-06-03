import React, { useState, useEffect } from 'react';

function AdminSubjectAllocation() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [term, setTerm] = useState('Term 1');
  const [allocations, setAllocations] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('single');

  useEffect(() => {
    loadClasses();
    loadSubjects();
    loadAllocations();
  }, []);

  const loadClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/AdminSubjectAllocation/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/AdminSubjectAllocation/available-subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadAllocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/AdminSubjectAllocation/student-allocations?year=${academicYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAllocations(data);
    } catch (error) {
      console.error('Error loading allocations:', error);
    }
  };

  const loadStudentsByClass = async () => {
    if (!selectedClass || !selectedStream) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/AdminSubjectAllocation/students-by-class/${selectedClass}/${selectedStream}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadStudentSubjects = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/AdminSubjectAllocation/student-subjects/${studentId}?year=${academicYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSelectedSubjects(data.AllocatedSubjects?.map(s => s.SubjectId) || []);
    } catch (error) {
      console.error('Error loading student subjects:', error);
    }
  };

  const handleClassChange = (e) => {
    const [className, stream] = e.target.value.split('|');
    setSelectedClass(className);
    setSelectedStream(stream);
    loadStudentsByClass();
  };

  const handleStudentSelect = (studentId) => {
    const student = students.find(s => s.id === parseInt(studentId));
    setSelectedStudent(student);
    if (student) {
      loadStudentSubjects(parseInt(studentId));
    }
  };

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleAllocateToStudent = async () => {
    if (!selectedStudent || selectedSubjects.length === 0) {
      setMessage('Please select a student and at least one subject');
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
          studentId: selectedStudent.id,
          subjectIds: selectedSubjects,
          academicYear: academicYear,
          term: term
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(` ${data.message}`);
        loadAllocations();
        loadStudentSubjects(selectedStudent.id);
        setSelectedSubjects([]);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error allocating subjects');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleBulkAllocate = async () => {
    if (!selectedClass || !selectedStream || selectedSubjects.length === 0) {
      setMessage('Please select a class and at least one subject');
      return;
    }

    if (!confirm(`Allocate ${selectedSubjects.length} subject(s) to ALL students in ${selectedClass} ${selectedStream}?`)) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://school-yathu.onrender.com/api/AdminSubjectAllocation/bulk-allocate-to-class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          className: selectedClass,
          stream: selectedStream,
          subjectIds: selectedSubjects,
          academicYear: academicYear,
          term: term
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`${data.message}`);
        loadAllocations();
        setSelectedSubjects([]);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error bulk allocating subjects');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleRemoveAllocation = async (allocationId) => {
    if (!confirm('Remove this subject allocation? The student will no longer see this subject.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://school-yathu.onrender.com/api/AdminSubjectAllocation/remove-allocation/${allocationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(` ${data.message}`);
        loadAllocations();
        if (selectedStudent) {
          loadStudentSubjects(selectedStudent.id);
        }
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error removing allocation');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Student Subject Allocation</h2>
          <p className="text-sm text-gray-500 mt-1">
            Allocate subjects to students - they will appear on student and teacher dashboards
          </p>
        </div>
        <div className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
          Academic Year: {academicYear}
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg mb-4 ${
          message.includes('') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Configuration Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
        <div>
          <label className="block text-gray-700 mb-2 font-semibold">Academic Year</label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={academicYear}
            onChange={(e) => {
              setAcademicYear(parseInt(e.target.value));
              loadAllocations();
            }}
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2 font-semibold">Term</label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          >
            <option>Term 1</option>
            <option>Term 2</option>
            <option>Term 3</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-2 font-semibold">Select Class</label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            onChange={handleClassChange}
          >
            <option value="">Select a class</option>
            {classes.map(c => (
              <option key={c.id} value={`${c.Name}|${c.Stream}`}>
                {c.Name} {c.Stream}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-semibold transition-all duration-200 ${
            activeTab === 'single' 
              ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50/30' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('single')}
        >
          Single Student Allocation
        </button>
        <button
          className={`px-4 py-2 font-semibold transition-all duration-200 ${
            activeTab === 'bulk' 
              ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50/30' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('bulk')}
        >
          Bulk Class Allocation
        </button>
      </div>

      {/* Single Student Allocation */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Student Selection */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-semibold text-lg mb-4 text-gray-800">Select Student</h3>
            <select
              className="w-full px-3 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleStudentSelect(e.target.value)}
              disabled={!selectedClass}
            >
              <option value="">Select a student</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.AdmissionNumber} - {s.FullName}
                </option>
              ))}
            </select>

            {selectedStudent && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-800 mb-2">Student Details:</p>
                <p className="text-sm"><strong>Name:</strong> {selectedStudent.FullName}</p>
                <p className="text-sm"><strong>Admission:</strong> {selectedStudent.AdmissionNumber}</p>
                <p className="text-sm"><strong>Class:</strong> {selectedStudent.Class} {selectedStudent.Stream}</p>
              </div>
            )}

            {!selectedClass && (
              <div className="bg-yellow-50 p-3 rounded-lg text-yellow-700 text-sm border border-yellow-200">
                Please select a class first to see students
              </div>
            )}
          </div>

          {/* Right Panel - Subject Selection */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-semibold text-lg mb-4 text-gray-800">
              Select Subjects 
              {selectedStudent && <span className="text-sm text-gray-500 ml-2">for {selectedStudent.FullName}</span>}
            </h3>
            
            {!selectedStudent ? (
              <div className="text-center py-8 text-gray-500">
                Select a student first to allocate subjects
              </div>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto space-y-2 mb-4 border rounded-lg p-2">
                  {subjects.map(subject => (
                    <label key={subject.Id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer border transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(subject.Id)}
                        onChange={() => handleSubjectToggle(subject.Id)}
                        className="mr-3 w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{subject.Name}</div>
                        <div className="text-sm text-gray-500">Code: {subject.Code}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-gray-500">
                    Selected: <strong className="text-blue-600">{selectedSubjects.length}</strong> subject(s)
                  </span>
                  <button
                    onClick={handleAllocateToStudent}
                    disabled={loading || selectedSubjects.length === 0}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-all duration-200 shadow-sm"
                  >
                    {loading ? 'Allocating...' : ' Allocate Subjects'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bulk Class Allocation */}
      {activeTab === 'bulk' && (
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">
            Bulk Allocate to Class: 
            <span className="text-blue-600 ml-2">{selectedClass || '—'} {selectedStream || '—'}</span>
          </h3>
          
          {!selectedClass ? (
            <div className="text-center py-8 text-yellow-600 bg-yellow-50 rounded-lg border border-yellow-200">
              Please select a class from the dropdown above to bulk allocate subjects
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <p className="text-sm">
                  👥 <strong>{students.length}</strong> student(s) in {selectedClass} {selectedStream}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  All selected subjects will be allocated to ALL students in this class
                </p>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2 mb-4 border rounded-lg p-2">
                {subjects.map(subject => (
                  <label key={subject.Id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer border transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject.Id)}
                      onChange={() => handleSubjectToggle(subject.Id)}
                      className="mr-3 w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{subject.Name}</div>
                      <div className="text-sm text-gray-500">Code: {subject.Code}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-gray-500">
                  Selected: <strong className="text-blue-600">{selectedSubjects.length}</strong> subject(s) for <strong>{students.length}</strong> student(s)
                </span>
                <button
                  onClick={handleBulkAllocate}
                  disabled={loading || selectedSubjects.length === 0 || students.length === 0}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-all duration-200 shadow-sm"
                >
                  {loading ? ' Allocating...' : `Bulk Allocate to ${students.length} Students`}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Current Allocations Table */}
      <div className="mt-8">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800">
          Current Subject Allocations
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">({allocations.length} allocations)</span>
        </h3>
        
        {allocations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border">
            No subject allocations found for {academicYear}. Create allocations above.
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
                  <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                  <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase">Term/Year</th>
                  <th className="px-4 py-3 border-b text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allocations.map(allocation => (
                  <tr key={allocation.Id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 text-sm text-gray-900">{allocation.StudentName}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{allocation.AdmissionNumber}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{allocation.StudentClass} {allocation.StudentStream}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className="font-medium text-gray-800">{allocation.SubjectName}</span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">{allocation.TeacherName}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{allocation.Term} {allocation.AcademicYear}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleRemoveAllocation(allocation.Id)}
                        className="text-red-500 hover:text-red-700 text-sm transition-colors"
                        title="Remove allocation"
                      >
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
    </div>
  );
}

export default AdminSubjectAllocation;